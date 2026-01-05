import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import {
  Component,
  // AfterViewInit,
  ViewChild,
  Input,
  Signal,
  inject,
  computed,
  effect,
  signal,
} from '@angular/core';
import { format, isWithinInterval } from 'date-fns';
import { CalendarViewService } from '../../../services/calendarView';
import { CalendarService } from '../../../services/calendars';
import { CommonModule } from '@angular/common';
import { WeeklyRow } from '../../../pages/calendar/calendar';

@Component({
  selector: 'app-weekly-calendar',
  imports: [CommonModule, ScrollingModule],
  templateUrl: './weekly-calendar.html',
  styleUrls: ['./weekly-calendar.scss'],
})
export class WeeklyCalendarComponent {
  private calendarView = inject(CalendarViewService);
  private calendarService = inject(CalendarService);

  @ViewChild(CdkVirtualScrollViewport)
  viewport!: CdkVirtualScrollViewport;

  @Input({ required: true }) weeksToRender!: Signal<WeeklyRow[]>;
  readonly rowsComputed = computed(() => this.weeksToRender());

  // readonly weeks = computed(() => this.allWeeks);
  readonly weeks = computed(() => this.weeksToRender());
  readonly currentMonth = this.calendarView.monthName;
  readonly currentYear = this.calendarService.currentYear;
  readonly loading = signal(true);

  private hasInitialScroll = false;

  constructor() {
    effect(() => {
      const rows = this.rowsComputed();

      if (!rows.length || !this.viewport || this.hasInitialScroll) return;

      requestAnimationFrame(() => this.scrollToToday());
    });
  }

  // ngAfterViewInit() {

  //   // prefetch around the visible window on scroll
  //   // this.viewport.scrolledIndexChange.subscribe((index) => {
  //   //   this.prefetchAround(index);
  //   // });
  // }

  tasksForDate(date: Date) {
    const iso = format(date, 'yyyy-MM-dd');
    return this.calendarView.tasks().filter((t) => t.date === iso) ?? [];
  }

  scrollToToday() {
    const today = new Date();

    const index = this.rowsComputed().findIndex(
      (row) =>
        row.type === 'week' && isWithinInterval(today, { start: row.week.start, end: row.week.end })
    );

    if (index < 0 || !this.viewport) return;

    if (!this.hasInitialScroll) {
      this.viewport.scrollToIndex(index, 'auto');
      this.hasInitialScroll = true;

      requestAnimationFrame(() => {
        this.loading.set(false);
      })
    } else {
      this.viewport.scrollToIndex(index, 'smooth');
    }
  }

  // simple index trackBy
  trackByIndex = (i: number) => i;

  // expose weekday names (Mon..Sun)
  get weekDayNames() {
    return this.calendarView.weekDays;
  }
}
