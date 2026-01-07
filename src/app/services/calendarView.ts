import { computed, inject, Injectable, signal } from '@angular/core';
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

@Injectable({
  providedIn: 'root',
})
export class CalendarViewService {
  private calendarService = inject(CalendarService);

  private _currentYear = signal<number>(new Date().getFullYear());
  private _currentMonth = signal<number>(new Date().getMonth());

  readonly currentYear = this._currentYear.asReadonly();
  readonly currentMonth = this._currentMonth.asReadonly();
  readonly tasks = computed(() => {
    return this.calendarService.getCachedTasksForMonth(this.currentYear(), this.currentMonth());
  });

  readonly weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  readonly monthName = computed(() => {
    const date = new Date(this.currentYear(), this.currentMonth());
    return format(date, 'MMMM');
  });

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

    await this.calendarService.fetchTasksForMonth(year, month);

    this.calendarService.prefetchAdjacentMonths(year, month);
  }

  async initialize(): Promise<void> {
    // TODO: Change this to only retrieve calendarIds inside the user filter!
    await this.calendarService.fetchUserCalendarIds();
    await this.goToMonth(this.currentYear(), this.currentMonth());
  }

  async goToToday(): Promise<void> {
    const today = new Date();
    await this.goToMonth(today.getFullYear(), today.getMonth());
  }
}
