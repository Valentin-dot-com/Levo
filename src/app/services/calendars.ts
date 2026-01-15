import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase';
import { Calendar } from '../models/calendar.model';
import { CreateTask, Task } from '../models/task.model';
import { UUID } from '../models/primitives.model';
import { AuthService } from './authenticate';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private supabase = inject(SupabaseService);
  private auth = inject(AuthService);

  private _calendars = signal<Calendar[]>([]);
  private _taskCache = signal<Map<string, Task[]>>(new Map());
  private _calendarIds = signal<UUID[]>([]);
  private _pendingRequests = new Map<string, Promise<void>>();
  private _todoTasks = signal<Task[]>([]);

  readonly calendars = this._calendars.asReadonly();
  readonly calendarIds = this._calendarIds.asReadonly();
  readonly todoTasks = this._todoTasks.asReadonly();

  // readonly tasks = computed<Task[]>(() => {
  //   const key = this.getMonthKey(this.calendarView.currentYear(), this.calendarView.currentMonth());
  //   return this._taskCache().get(key) ?? [];
  // });

  private getMonthKey(year: number, month: number): string {
    return `${year}-${month}`;
  }

  getMonthRange(year: number, month: number) {
    const start = new Date(Date.UTC(year, month, 1));
    const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59));

    return { start: start.toISOString(), end: end.toISOString() };
  }

  async fetchUserCalendarIds(): Promise<void> {
    const userId = this.auth.getUserId();

    const { data: memberships, error } = await this.supabase.supabaseClient
      .from('calendar_memberships')
      .select('calendar_id')
      .eq('user_id', userId);

    if (error) throw error;

    this._calendarIds.set((memberships ?? []).map((m) => m.calendar_id));
  }

  public getCachedTasksForMonth(year: number, month: number): Task[] {
    const key = this.getMonthKey(year, month);
    return this._taskCache().get(key) ?? [];
  }

  prefetchAdjacentMonths(year: number, month: number): void {
    // Previous month
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;

    // Next month
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;

    const prevKey = this.getMonthKey(prevYear, prevMonth);
    if (!this._taskCache().has(prevKey) && !this._pendingRequests.has(prevKey)) {
      this.fetchTasksForMonth(prevYear, prevMonth);
    }

    const nextKey = this.getMonthKey(nextYear, nextMonth);
    if (!this._taskCache().has(nextKey) && !this._pendingRequests.has(nextKey)) {
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

  async fetchUserCalendars(): Promise<void> {
    const calendarIds = this._calendarIds();

    if (calendarIds.length === 0) {
      return;
    }

    const { data, error } = await this.supabase.supabaseClient
      .from('calendars')
      .select('id, owner_id, name, is_shared, created_at')
      .in('id', calendarIds);

    if (error) throw error;
    this._calendars.set(data ?? []);
  }

  async fetchTasksForMonth(year: number, month: number): Promise<void> {
    const key = this.getMonthKey(year, month);

    // Skip if already cached
    if (this._taskCache().has(key)) {
      return;
    }

    // If there's already a pending request for this month, wait for it
    const pendingRequest = this._pendingRequests.get(key);
    if (pendingRequest) {
      return pendingRequest;
    }

    const fetchPromise = (async () => {
      try {
        const { start, end } = this.getMonthRange(year, month);

        const calendarIds = this._calendarIds();

        if (calendarIds.length === 0) {
          throw new Error('No calendar memberships for current user. Could not fetch tasks');
        }

        const { data, error } = await this.supabase.supabaseClient
          .from('tasks')
          .select('*')
          .in('calendar_id', calendarIds)
          .gte('date', start)
          .lte('date', end);

        if (error) throw error;
        this.updateCache(key, data ?? []);
      } finally {
        this._pendingRequests.delete(key);
      }
    })();

    this._pendingRequests.set(key, fetchPromise);
    return fetchPromise;
  }

  async fetchTodoTasks(): Promise<void> {
    const calendarIds = this._calendarIds();

    if (!calendarIds) return;

    const { data, error } = await this.supabase.supabaseClient
    .from('tasks')
    .select('*')
    .in('calendar_id', calendarIds)
    .is('date', null);

    if (error) throw error;

    this._todoTasks.set(data ?? []);
  }

  async createTask(task: CreateTask) {
    const { data, error } = await this.supabase.supabaseClient
    .from('tasks')
    .insert({
      calendar_id: task.calendar_id,
      title: task.title,
      description: task.description ?? null,
      location: task.location ?? null,
      date: task.date ?? null,
      scheduled_at: task.scheduled_at ?? null,
    })
    .select()
    .single();

    if (error) throw error;

    if (data.date) {
      // Add to taskCache
    } else {
      this._todoTasks.update(tasks => [...tasks, data]);
    }

    return data;
  }

  async initCalendarData(): Promise<void> {
    // const now = new Date();
    await this.fetchUserCalendarIds();
    await this.fetchUserCalendars();
    // await this.calendarView.goToMonth(now.getFullYear(), now.getMonth());
  }
}
