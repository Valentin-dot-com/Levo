import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { CalendarService } from './calendars';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  format,
  getDate,
  getISOWeek,
  getDay,
} from 'date-fns';
import { CalendarDay, CalendarMonth, CalendarWeek } from '../models/calendar.model';
import { AuthService } from './authenticate';

@Injectable({
  providedIn: 'root',
})
export class CalendarViewService {
  private calendarService = inject(CalendarService);
  private auth = inject(AuthService);

  private _initialized = signal<boolean>(false);
  private _currentYear = signal<number>(new Date().getFullYear());
  private _currentMonth = signal<number>(new Date().getMonth());
  private _selectedDay = signal<Date | null>(null);

  readonly initialized = this._initialized.asReadonly();
  readonly selectedDay = this._selectedDay.asReadonly();
  readonly currentYear = this._currentYear.asReadonly();
  readonly currentMonth = this._currentMonth.asReadonly();

  constructor() {
    effect(() => {
      if (!this.auth.userSignal()) {
        this.reset()
      }
    })
  }

  readonly events = computed(() => {
    return this.calendarService.getAllCachedEvents();
  });

  readonly eventsForSelectedDay = computed(() => {
    const day = this._selectedDay();
    if (!day) return [];

    const year = day.getFullYear();
    const month = day.getMonth();
    const isoDay = format(day, 'yyyy-MM-dd');

    const monthEvents = this.calendarService.getCachedEventsForMonth(year, month);

    return monthEvents.filter((e) => e.date === isoDay);
  });

  readonly thisWeek = computed(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return {
      start: weekStart,
      end: weekEnd,
      weekNumber: getISOWeek(weekStart),
      year: weekStart.getFullYear(),
      monthKey: format(today, 'yyyy-MM'),
      monthLabel: format(today, 'MMMM'),
      days: days.map((d) => ({
        date: d,
        dayNumber: getDate(d),
        weekdayLabel: format(d, 'EEEE'),
        weekdayIndex: (getDay(d) + 6) % 7,
        inMonth: format(d, 'MMM'),
        isCurrentMonth: isSameMonth(d, today),
        isToday: isToday(d),
      })),
    } as CalendarWeek;
  });

  readonly weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

  readonly monthName = computed(() => {
    const date = new Date(this.currentYear(), this.currentMonth());
    return format(date, 'MMMM');
  });

  setSelectedDay(date: Date | null) {
    if (date) {
      this._selectedDay.set(date)
    } else {
      this._selectedDay.set(null);
    }
  }

  clearSelectedDay() {
    this._selectedDay.set(null);
  }

  generateDaysForMonth(date: Date): CalendarDay[] {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return days.map((d) => {
      return {
        date: d,
        dayNumber: getDate(d),
        weekdayLabel: format(d, 'EEEE'),
        weekdayIndex: (getDay(d) + 6) % 7,
        inMonth: format(d, 'MMM'),
        isCurrentMonth: isSameMonth(d, date),
        isToday: isToday(d),
      };
    });
  }

  buildWeeksForMonth(days: CalendarDay[], monthDate: Date): CalendarWeek[] {
    const weeks: CalendarWeek[] = [];
    let currentWeek: CalendarDay[] = [];

    for (const day of days) {
      if (day.isCurrentMonth) {
        currentWeek.push(day);
      }

      if (day.date.getDay() === 0 || day === days[days.length - 1]) {
        if (currentWeek.length) {
          const weekStart = currentWeek[0].date;

          weeks.push({
            start: weekStart,
            end: currentWeek[currentWeek.length - 1].date,
            weekNumber: getISOWeek(weekStart),
            year: weekStart.getFullYear(),
            monthKey: format(monthDate, 'yyyy-MM'),
            monthLabel: format(monthDate, 'MMMM'),
            days: [...currentWeek],
          });

          currentWeek = [];
        }
      }
    }

    return weeks;
  }

  generateMonth(date: Date): CalendarMonth {
    const year = date.getFullYear();
    const month = date.getMonth();

    const days: CalendarDay[] = this.generateDaysForMonth(date);
    const weeks = this.buildWeeksForMonth(days, date);

    return {
      id: format(date, 'yyyy-MM'),
      date,
      name: format(date, 'MMMM yyyy'),
      monthNumber: month,
      year,
      days,
      weeks,
    };
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

  async goToMonth(year: number, month: number): Promise<void> {
    this._currentYear.set(year);
    this._currentMonth.set(month);

    await this.calendarService.fetchEventsForMonth(year, month);

    this.calendarService.prefetchAdjacentMonths(year, month);
  }

  async initialize(): Promise<void> {
    if (this._initialized()) {
      console.warn('CalendarViewService already initialized');
      return;
    }

    try {
      await this.goToMonth(this.currentYear(), this.currentMonth());

      this._initialized.set(true);
    } catch (error) {
      console.error('Failed to initialize calendar view:', error);
      throw error;
    }
  }

  async goToToday(): Promise<void> {
    const today = new Date();
    await this.goToMonth(today.getFullYear(), today.getMonth());
  }

  reset() {
    this._initialized.set(false);
    this._currentYear.set(new Date().getFullYear());
    this._currentMonth.set(new Date().getMonth());
    this._selectedDay.set(null);
  }
}
