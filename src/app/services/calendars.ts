import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase';
import { Calendar } from '../models/calendar.model';
import { CreateEvent, Event } from '../models/event.model';
import { UUID } from '../models/primitives.model';
import { AuthService } from './authenticate';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private supabase = inject(SupabaseService);
  private auth = inject(AuthService);

  private _calendars = signal<Calendar[]>([]);
  private _eventCache = signal<Map<string, Event[]>>(new Map());
  private _calendarIds = signal<UUID[]>([]);
  private _pendingRequests = new Map<string, Promise<void>>();
  private _todoEvents = signal<Event[]>([]);

  readonly calendars = this._calendars.asReadonly();
  readonly calendarIds = this._calendarIds.asReadonly();
  readonly todoEvents = this._todoEvents.asReadonly();

  private getMonthKey(year: number, month: number): string {
    return `${year}-${month}`;
  }

  private getMonthKeyFromDate(date: Date): string {
    return this.getMonthKey(date.getFullYear(), date.getMonth());
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

  public getCachedEventsForMonth(year: number, month: number): Event[] {
    const key = this.getMonthKey(year, month);
    return this._eventCache().get(key) ?? [];
  }

  prefetchAdjacentMonths(year: number, month: number): void {
    // Previous month
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;

    // Next month
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;

    const prevKey = this.getMonthKey(prevYear, prevMonth);
    if (!this._eventCache().has(prevKey) && !this._pendingRequests.has(prevKey)) {
      this.fetchEventsForMonth(prevYear, prevMonth);
    }

    const nextKey = this.getMonthKey(nextYear, nextMonth);
    if (!this._eventCache().has(nextKey) && !this._pendingRequests.has(nextKey)) {
      this.fetchEventsForMonth(nextYear, nextMonth);
    }
  }

  private updateCache(key: string, events: Event[]): void {
    this._eventCache.update((cache) => {
      const newCache = new Map(cache);
      newCache.set(key, events);
      return newCache;
    });
  }

  private addEventToCache(event: Event) {
    if (!event.date) return;

    const eventDate = new Date(event.date);
    const key = this.getMonthKeyFromDate(eventDate);

    const currentCache = this._eventCache().get(key);
    if (currentCache) {
      this.updateCache(key, [...currentCache, event]);
    }
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

  async fetchEventsForMonth(year: number, month: number): Promise<void> {
    const key = this.getMonthKey(year, month);

    // Skip if already cached
    if (this._eventCache().has(key)) {
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
          throw new Error('No calendar memberships for current user. Could not fetch events');
        }

        const { data, error } = await this.supabase.supabaseClient
          .from('events')
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

  async fetchTodoEvents(): Promise<void> {
    const calendarIds = this._calendarIds();

    if (!calendarIds) return;

    const { data, error } = await this.supabase.supabaseClient
      .from('events')
      .select('*')
      .in('calendar_id', calendarIds)
      .is('date', null);

    if (error) throw error;

    this._todoEvents.set(data ?? []);
  }

  async createEvent(event: CreateEvent) {
    const { data, error } = await this.supabase.supabaseClient
      .from('events')
      .insert({
        calendar_id: event.calendar_id,
        title: event.title,
        description: event.description ?? null,
        location: event.location ?? null,
        date: event.date ?? null,
        scheduled_at: event.scheduled_at ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    if (data.date) {
      this.addEventToCache(data);
    } else {
      this._todoEvents.update((events) => [...events, data]);
    }

    return data;
  }

  async updateEvent(id: UUID, event: CreateEvent) {
    const { data, error } = await this.supabase.supabaseClient
      .from('events')
      .update({
        calendar_id: event.calendar_id,
        title: event.title,
        description: event.description ?? null,
        location: event.location ?? null,
        date: event.date ?? null,
        scheduled_at: event.scheduled_at ?? null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (data.date) {
      this.addEventToCache(data);
    } else {
      this._todoEvents.update((events) => [...events, data]);
    }

    return data;
  }

  async initCalendarData(): Promise<void> {
    await this.fetchUserCalendarIds();
    await this.fetchUserCalendars();
  }
}
