import { computed, inject, Injectable } from '@angular/core';
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
} from 'date-fns';
import { CalendarDay } from '../models/calendar.model';

@Injectable({
  providedIn: 'root',
})
export class CalendarViewService {
  private calendarService = inject(CalendarService);

  readonly currentYear = this.calendarService.currentYear;
  readonly currentMonth = this.calendarService.currentMonth;
  readonly tasks = this.calendarService.tasks;

  readonly weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  readonly monthName = computed(() => {
    const date = new Date(this.currentYear(), this.currentMonth());
    return format(date, 'MMMM');
  });

  getCalendarDaysForMonth(date: Date): CalendarDay[] {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return days.map((d) => {
      return {
        date: d,
        dayNumber: getDate(d),
        inMonth: format(d, 'MM'),
        isCurrentMonth: isSameMonth(d, date),
        isToday: isToday(d),
      };
    });
  }

  async initialize(): Promise<void> {
    // TODO: Change this to only retrieve calendarIds inside the user filter!
    await this.calendarService.fetchUserCalendarIds();
    await this.calendarService.goToMonth(this.currentYear(), this.currentMonth());
  }

  async goToPrevious(): Promise<void> {
    await this.calendarService.goToPreviousMonth();
  }

  async goToNext(): Promise<void> {
    await this.calendarService.goToNextMonth();
  }

  async goToToday(): Promise<void> {
    const today = new Date();
    await this.calendarService.goToMonth(today.getFullYear(), today.getMonth());
  }
}
