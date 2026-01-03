import { computed, inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase';
import { Calendar } from '../models/calendar';
import { Task } from '../models/task';
import { CalendarWithTasks } from '../models/responses';
import { UUID } from '../models/primitives';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private supabase = inject(SupabaseService);

  private _calendars = signal<Calendar[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // Current view position
  private _currentYear = signal<number>(new Date().getFullYear());
  private _currentMonth = signal<number>(new Date().getMonth());

  // Cache: "2026-0" -> Task[]
  private _taskCache = signal<Map<string, Task[]>>(new Map());

  readonly calendars = this._calendars.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly currentYear = this._currentYear.asReadonly();
  readonly currentMonth = this._currentMonth.asReadonly();

  // Get tasks for current month from cache
  readonly tasks = computed<Task[]>(() => {
    const key = this.getMonthKey(this._currentYear(), this._currentMonth());
    return this._taskCache().get(key) ?? [];
  });

  // For filtering purposes
  readonly calendarsWithTasks = computed<CalendarWithTasks[]>(() => {
    const calendars = this._calendars();
    const tasks = this.tasks();

    return calendars.map((calendar) => ({
      ...calendar,
      tasks: tasks.filter((task) => task.calendar_id === calendar.id),
    }));
  });

  private getMonthKey(year: number, month: number): string {
    return `${year}-${month}`;
  }

  getMonthRange(year: number, month: number) {
    const start = new Date(Date.UTC(year, month, 1));
    const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59));

    return { start: start.toISOString(), end: end.toISOString() };
  }

  // Navigate to a specific month
  async goToMonth(year: number, month: number): Promise<void> {
    this._currentYear.set(year);
    this._currentMonth.set(month);

    await this.fetchTasksForMonth(year, month);

    // Prefetch adjacent months in background (don't await)
    this.prefetchAdjacentMonths(year, month);
  }

  async goToPreviousMonth(): Promise<void> {
    let year = this._currentYear();
    let month = this._currentMonth() - 1;

    if (month < 0) {
      month = 11;
      year--;
    }

    await this.goToMonth(year, month);
  }

  async goToNextMonth(): Promise<void> {
    let year = this._currentYear();
    let month = this._currentMonth() + 1;

    if (month > 11) {
      month = 0;
      year++;
    }

    await this.goToMonth(year, month);
  }

  private prefetchAdjacentMonths(year: number, month: number): void {
    // Previous month
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;

    // Next month
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;

    // Fetch if not cached (fire and forget)
    if (!this._taskCache().has(this.getMonthKey(prevYear, prevMonth))) {
      this.fetchTasksForMonth(prevYear, prevMonth);
    }
    if (!this._taskCache().has(this.getMonthKey(nextYear, nextMonth))) {
      this.fetchTasksForMonth(nextYear, nextMonth);
    }
  }

  private updateCache(key: string, tasks: Task[]): void {
    this._taskCache.update((cache) => {
      const newCache = new Map(cache);
      newCache.set(key, tasks);
      return newCache;
    });
  }

  // Optional: Clear old cached months to save memory
  clearOldCache(keepMonths = 6): void {
    const currentKey = this.getMonthKey(this._currentYear(), this._currentMonth());
    this._taskCache.update((cache) => {
      if (cache.size <= keepMonths) return cache;

      const newCache = new Map<string, Task[]>();
      newCache.set(currentKey, cache.get(currentKey) ?? []);
      return newCache;
    });
  }

  async fetchUserCalendars(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const userId = (await this.supabase.supabaseClient.auth.getUser()).data?.user?.id;

      const { data: memberships } = await this.supabase.supabaseClient
        .from('calendar_memberships')
        .select('calendar_id')
        .eq('user_id', userId);

      const calendarIds = memberships?.map((m) => m.calendar_id) ?? [];

      const { data, error } = await this.supabase.supabaseClient
        .from('calendars')
        .select('id, owner_id, name, is_shared, created_at', {
          count: 'exact',
        })
        .in('id', calendarIds);

      if (error) throw error;
      this._calendars.set(data ?? []);
    } catch (err) {
      this._error.set(err instanceof Error ? err.message : 'Failed to fetch calendars');
    } finally {
      this._loading.set(false);
    }
  }

  async fetchTasksForMonth(year: number, month: number): Promise<void> {
    const key = this.getMonthKey(year, month);

    // Skip if already cached
    if (this._taskCache().has(key)) {
      return;
    }

    this._loading.set(true);
    this._error.set(null);

    try {
      const { start, end } = this.getMonthRange(year, month);

      const userId = (await this.supabase.supabaseClient.auth.getUser()).data?.user?.id;

      const { data: memberships, error: membershipError } = await this.supabase.supabaseClient
        .from('calendar_memberships')
        .select('calendar_id')
        .eq('user_id', userId);

      if (membershipError) throw membershipError;

      const calendarIds: UUID[] = (memberships ?? []).map((m) => m.calendar_id);

      if (calendarIds.length === 0) {
        this.updateCache(key, []);
        return;
      }

      const { data, error } = await this.supabase.supabaseClient
        .from('tasks')
        .select('*')
        .in('calendar_id', calendarIds)
        .gte('scheduled_at', start)
        .lte('scheduled_at', end);

      if (error) throw error;
      this.updateCache(key, data ?? []);
    } catch (err) {
      this._error.set(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      this._loading.set(false);
    }
  }

  async fetchAll(): Promise<void> {
    const now = new Date();
    await Promise.all([
      this.fetchUserCalendars(),
      this.goToMonth(now.getFullYear(), now.getMonth()),
    ]);
  }
}
