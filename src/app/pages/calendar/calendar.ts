import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CalendarViewService } from '../../services/calendarView';
// import { MonthlyCalendarComponent } from '../../components/calendars/monthly-calendar/monthly-calendar';
import {
  addMonths,
} from 'date-fns';
import { CalendarMonth } from '../../models/calendar.model';
import { WeeklyCalendarComponent } from '../../components/calendars/weekly-calendar/weekly-calendar';
import { CalendarService } from '../../services/calendars';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, WeeklyCalendarComponent],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class CalendarComponent implements OnInit {
  protected calendarView = inject(CalendarViewService);
  private calendarService = inject(CalendarService);

  monthsToRender = signal<CalendarMonth[]>([]);

  async ngOnInit() {
    await this.calendarView.initialize();

    const now = new Date();

    const months: CalendarMonth[] = [];

    for (let i = -4; i <= 4; i++) {
      const date = addMonths(now, i);
      await this.calendarService.fetchTasksForMonth(date.getFullYear(), date.getMonth());
      months.push(this.calendarView.generateMonth(date));
    }

    this.monthsToRender.set(months);
  }

  async prependMonth(count = 3) {
    const months = this.monthsToRender();

    if (!months.length) return;

    const firstMonthDate = months[0].date;
    const newMonths: CalendarMonth[] = [];

    for (let i = count; i >= 1; i--) {
      const date = addMonths(firstMonthDate, -i);
      await this.calendarService.fetchTasksForMonth(date.getFullYear(), date.getMonth());
      newMonths.push(this.calendarView.generateMonth(date));
    }

    const updated = [...newMonths, ...months];
    this.monthsToRender.set(updated);
  }

  async appendMonth(count = 3) {
    const months = this.monthsToRender();

    if (!months.length) return

    const lastMonthDate = months[months.length - 1].date;
    const newMonths: CalendarMonth[] = [];

    for (let i = 1; i <= count; i++) {
      const date = addMonths(lastMonthDate, i);
      await this.calendarService.fetchTasksForMonth(date.getFullYear(), date.getMonth());
      newMonths.push(this.calendarView.generateMonth(date));
    }

    const updated = [...months, ...newMonths];
    this.monthsToRender.set(updated);
  }
}
