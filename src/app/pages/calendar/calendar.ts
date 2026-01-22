import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CalendarViewService } from '../../services/calendarView';
// import { MonthlyCalendarComponent } from '../../components/calendars/monthly-calendar/monthly-calendar';
import { addMonths, parse } from 'date-fns';
import { CalendarMonth } from '../../models/calendar.model';
import { WeeklyCalendarComponent } from '../../components/calendars/weekly-calendar/weekly-calendar';
import { CalendarService } from '../../services/calendars';
import { MonthlyCalendarComponent } from '../../components/calendars/monthly-calendar/monthly-calendar';
import { ScreenSizeService } from '../../services/ScreenSize';
import { DesktopDaySummaryComponent } from '../../components/desktop-day-summary/desktop-day-summary';
import { ActivatedRoute, Router } from '@angular/router';
import { DayComponent } from '../../components/day/day';

@Component({
  selector: 'app-calendar',
  imports: [
    CommonModule,
    WeeklyCalendarComponent,
    MonthlyCalendarComponent,
    DesktopDaySummaryComponent,
    DayComponent
  ],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class CalendarComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  protected calendarView = inject(CalendarViewService);
  private calendarService = inject(CalendarService);
  private screensizeService = inject(ScreenSizeService);

  selectedDay = this.calendarView.selectedDay;

  isDesktop = this.screensizeService.isDesktop;

  viewMode = signal<'weekly' | 'monthly'>('weekly');
  monthsToRender = signal<CalendarMonth[]>([]);

  setView(mode: 'weekly' | 'monthly') {
    this.viewMode.set(mode);
  }

  async ngOnInit() {
    const now = new Date();

    this.route.queryParamMap.subscribe((params) => {
      const day = params.get('day');
      if (!day) {
        this.calendarView.setSelectedDay(null);
      } else {
        const parsed = parse(day, 'yyyy-MM-dd', new Date());
        this.calendarView.setSelectedDay(parsed);
      }

    });


    const months: CalendarMonth[] = [];

    for (let i = -4; i <= 4; i++) {
      const date = addMonths(now, i);
      await this.calendarService.fetchEventsForMonth(date.getFullYear(), date.getMonth());
      months.push(this.calendarView.generateMonth(date));
    }

    this.monthsToRender.set(months);

    // Mark today as the first day TODO: Check if better somewhere else, maybe not needed every onInit...
    if (this.isDesktop()) {
      this.markDay(now);
    }
  }

  markDay(date: Date) {
    this.calendarView.setSelectedDay(date);
  }

  async prependMonth(count = 3) {
    const months = this.monthsToRender();

    if (!months.length) return;

    const firstMonthDate = months[0].date;
    const newMonths: CalendarMonth[] = [];

    for (let i = count; i >= 1; i--) {
      const date = addMonths(firstMonthDate, -i);
      await this.calendarService.fetchEventsForMonth(date.getFullYear(), date.getMonth());
      newMonths.push(this.calendarView.generateMonth(date));
    }

    const updated = [...newMonths, ...months];
    this.monthsToRender.set(updated);
  }

  async appendMonth(count = 3) {
    const months = this.monthsToRender();

    if (!months.length) return;

    const lastMonthDate = months[months.length - 1].date;
    const newMonths: CalendarMonth[] = [];

    for (let i = 1; i <= count; i++) {
      const date = addMonths(lastMonthDate, i);
      await this.calendarService.fetchEventsForMonth(date.getFullYear(), date.getMonth());
      newMonths.push(this.calendarView.generateMonth(date));
    }

    const updated = [...months, ...newMonths];
    this.monthsToRender.set(updated);
  }
}
