import {
  Component,
  Input,
  Signal,
  inject,
  signal,
  Output,
  EventEmitter,
  computed,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { format } from 'date-fns';
import { CalendarViewService } from '../../../services/calendarView';
import { CommonModule } from '@angular/common';
import { CalendarMonth } from '../../../models/calendar.model';

@Component({
  selector: 'app-weekly-calendar',
  imports: [CommonModule],
  templateUrl: './weekly-calendar.html',
  styleUrls: ['./weekly-calendar.scss'],
})
export class WeeklyCalendarComponent {
  private calendarView = inject(CalendarViewService);

  @Input({ required: true }) monthsToRender!: Signal<CalendarMonth[]>;

  @Output() nearTop = new EventEmitter<void>();
  @Output() nearBottom = new EventEmitter<void>();

  private readonly THRESHOLD = 300;
  private isEmittingTop = false;
  private isEmittingBottom = false;

  readonly currentMonth = this.calendarView.monthName;
  readonly currentYear = this.calendarView.currentYear;
  readonly loading = signal(true);
  readonly months = computed(() => this.monthsToRender());

  private hasInitialScroll = false;

  @ViewChild('scrollContainer', { static: true })
  container!: ElementRef<HTMLElement>;

  @ViewChild('todayAnchor')
  set todayAnchor(el: ElementRef<HTMLElement> | undefined) {
    if (!el || this.hasInitialScroll) return;

    const weekEl = el.nativeElement.closest('.week');

    if (!weekEl) return;

    weekEl.scrollIntoView({
      block: 'start',
      behavior: 'auto', // instant on initial load
    });

    this.loading.set(false);
    this.hasInitialScroll = true;
  }

  tasksForDate(date: Date) {
    const iso = format(date, 'yyyy-MM-dd');
    return this.calendarView.tasks().filter((t) => t.date === iso) ?? [];
  }

  onScroll() {
    if (!this.hasInitialScroll) return;

    const el = this.container.nativeElement;

    const top = el.scrollTop;
    const bottom = el.scrollHeight - el.scrollTop - el.clientHeight;

    if (top < this.THRESHOLD && !this.isEmittingTop) {
      this.isEmittingTop = true;
      this.nearTop.emit();

      setTimeout(() => (this.isEmittingTop = false), 500);
    }

    if (bottom < this.THRESHOLD && !this.isEmittingBottom) {
      this.isEmittingBottom = true;
      this.nearBottom.emit();

      setTimeout(() => (this.isEmittingBottom = false), 500);
    }
  }

  scrollToToday() {
    const el = this.container.nativeElement.querySelector('[data-today]');

    if (!el) return;

    const weekEl = el.closest('.week');

    if (!weekEl) return;

    weekEl.scrollIntoView({
      block: 'start',
      behavior: 'smooth',
    });
  }

  get weekDayNames() {
    return this.calendarView.weekDays;
  }
}
