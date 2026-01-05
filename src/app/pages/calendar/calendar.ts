import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CalendarViewService } from '../../services/calendarView';
import { MonthlyCalendarComponent } from '../../components/calendars/monthly-calendar/monthly-calendar';
import {
  addDays,
  addWeeks,
  eachDayOfInterval,
  format,
  getDate,
  getISOWeek,
  isToday,
  startOfWeek,
} from 'date-fns';
import { CalendarDay, CalendarMonth, CalendarWeek } from '../../models/calendar.model';
import { WeeklyCalendarComponent } from '../../components/calendars/weekly-calendar/weekly-calendar';

export type WeeklyRow =
  | {
      type: 'month';
      key: string;
      label: string;
    }
  | {
      type: 'week';
      week: CalendarWeek;
    };

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, MonthlyCalendarComponent, WeeklyCalendarComponent],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class CalendarComponent implements OnInit {
  protected view = inject(CalendarViewService);

  monthsToRender = signal<CalendarMonth[]>([]);
  weeksToRender = signal<WeeklyRow[]>([]);

  async ngOnInit() {
    await this.view.initialize();

    const months = this.generateMonths();
    this.monthsToRender.set(months);
    this.weeksToRender.set(this.buildWeeklyRows(months));
  }

  buildWeeklyRows(months: CalendarMonth[]): WeeklyRow[] {
    const rows: WeeklyRow[] = [];

    for (const month of months) {
      rows.push({
        type: 'month',
        key: month.id,
        label: month.name,
      });

      for (const week of month.weeks) {
        rows.push({
          type: 'week',
          week,
        })
      }
    }

    return rows;
  }

  generateWeeks(start: Date, end: Date): CalendarWeek[] {
    const weeks: CalendarWeek[] = [];
    let current = startOfWeek(start, { weekStartsOn: 1 });

    while (current <= end) {
      const weekStart = current;
      const weekEnd = addDays(weekStart, 6);

      const monthDate = weekStart.getDate() >= 4 ? weekStart : addDays(weekStart, 6);

      weeks.push({
        start: weekStart,
        end: weekEnd,
        weekNumber: getISOWeek(weekStart),
        monthKey: format(monthDate, 'yyyy-MM'),
        monthLabel: format(monthDate, 'MMMM yyyy'),
        days: eachDayOfInterval({ start: weekStart, end: weekEnd }).map((d) => ({
          date: d,
          dayNumber: getDate(d),
          inMonth: format(d, 'MMMM'),
          isCurrentMonth: false,
          isToday: isToday(d),
        })),
      });

      current = addWeeks(current, 1);
    }

    return weeks;
  }

  generateMonths() {
    const startYear = 2000;
    const endYear = 2100;
    const months: CalendarMonth[] = [];

    for (let year = startYear; year <= endYear; year++) {
      for (let month = 0; month < 12; month++) {
        const date = new Date(year, month, 1);
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);

        const days: CalendarDay[] = this.view.getCalendarDaysForMonth(date);

        const weeks: CalendarWeek[] = this.generateWeeks(monthStart, monthEnd);

        months.push({
          id: format(date, 'yyyy-MM'),
          date,
          name: format(date, 'MMMM yyyy'),
          monthNumber: month,
          year,
          days,
          weeks,
        });
      }
    }
    return months;
  }
}
