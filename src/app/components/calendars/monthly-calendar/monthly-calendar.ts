import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  Signal,
  signal,
  ViewChild, OnDestroy,
} from '@angular/core';
import { format } from 'date-fns';
import { CalendarMonth } from '../../../models/calendar.model';
import { CalendarViewService } from '../../../services/calendarView';
import { LoaderComponent } from '../../loader/loader';
import { ArrowLeftIconComponent } from '../../../icons/arrowLeftIcon';
import { ArrowRightIconComponent } from '../../../icons/arrowRightIcon';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-monthly-calendar',
  imports: [CommonModule, LoaderComponent, ArrowLeftIconComponent, ArrowRightIconComponent, RouterLink],
  templateUrl: './monthly-calendar.html',
  styleUrl: './monthly-calendar.scss',
})
export class MonthlyCalendarComponent implements OnDestroy {
  private calendarView = inject(CalendarViewService);

  @Input({ required: true }) monthsToRender!: Signal<CalendarMonth[]>;

  @Output() nearTop = new EventEmitter<void>();
  @Output() nearBottom = new EventEmitter<void>();

  private readonly THRESHOLD = 1000;
  private isEmittingTop = false;
  private isEmittingBottom = false;
  private todayObserver?: IntersectionObserver;

  readonly currentMonth = this.calendarView.monthName;
  readonly currentYear = this.calendarView.currentYear;
  readonly loading = signal(true);
  readonly isBtnScrolling = signal(false);
  readonly isTodayVisible = signal(true);
  readonly months = computed(() => this.monthsToRender());

  private hasInitialScroll = false;

  @ViewChild('scrollContainer', { static: true })
  container!: ElementRef<HTMLElement>;

  @ViewChild('todayAnchor')
  set todayAnchor(el: ElementRef<HTMLElement> | undefined) {
    if (!el || this.hasInitialScroll) return;

    const monthEl = el.nativeElement.closest('.calendar-monthly');

    if (!monthEl) return;

    const container = this.container.nativeElement;

    const monthTop =
      monthEl.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop;

    container.scrollTo({
      top: monthTop + this.remToPx(4),
      behavior: 'auto',
    });

    this.loading.set(false);
    this.hasInitialScroll = true;

    this.todayObserver?.disconnect();

    this.todayObserver = new IntersectionObserver(
      ([entry]) => {
        this.isTodayVisible.set(entry.isIntersecting);
      },
      {
        root: this.container.nativeElement, // 🔑 viktigt
        threshold: 0.1, // räcker att lite syns
      }
    );

    this.todayObserver.observe(el.nativeElement);
  }

  eventsForDate(date: Date) {
    const iso = format(date, 'yyyy-MM-dd');
    return this.calendarView.events().filter((t) => t.date === iso) ?? [];
  }

  onScroll() {
    if (!this.hasInitialScroll) return;
    if (this.isBtnScrolling()) return;

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

    this.updateCurrentMonthYear();
  }

  scrollToToday() {
    this.calendarView.goToToday();
    this.isBtnScrolling.set(true);

    requestAnimationFrame(() => {
      const el = this.container.nativeElement.querySelector('[data-today]');
      if (!el) return;

      const monthEl = el.closest('.calendar-monthly');
      if (!monthEl) return;

      const container = this.container.nativeElement;

      const top =
        monthEl.getBoundingClientRect().top -
        container.getBoundingClientRect().top +
        container.scrollTop;

      container.scrollTo({
        top: top + this.remToPx(4),
        behavior: 'smooth',
      });

      setTimeout(() => {
        this.isBtnScrolling.set(false);
      }, 400);
    });
  }

  private remToPx(rem: number): number {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
  }

  get weekDayNames() {
    return this.calendarView.weekDays;
  }

  private updateCurrentMonthYear() {
    const container = this.container.nativeElement;
    const monthSections = Array.from(container.querySelectorAll<HTMLElement>('.calendar-monthly'));

    const containerTop = container.getBoundingClientRect().top;

    const visibleMonth = monthSections.find((section) => {
      const rect = section.getBoundingClientRect();
      return rect.bottom > containerTop + 150;
    });

    if (!visibleMonth) return;

    const monthId = visibleMonth.dataset['month'];
    if (!monthId) return;

    const [year, month] = monthId.split('-');

    this.calendarView.goToMonth(Number(year), Number(month) - 1);
  }

  async goToPrevious() {
    this.isBtnScrolling.set(true);
    await this.calendarView.goToPreviousMonth();
    this.scrollToActiveMonth();
    setTimeout(() => {
      this.isBtnScrolling.set(false);
    }, 400);
  }

  async goToNext() {
    this.isBtnScrolling.set(true);
    await this.calendarView.goToNextMonth();
    this.scrollToActiveMonth();
    setTimeout(() => {
      this.isBtnScrolling.set(false);
    }, 400);
  }

  private scrollToActiveMonth() {
    const year = this.calendarView.currentYear();
    const monthIndex = this.calendarView.currentMonth();
    const key = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    const el = this.container.nativeElement.querySelector(`[data-month="${key}"]`);

    if (!el) return;

    const container = this.container.nativeElement;

    const weekTop =
      el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;

    container.scrollTo({
      top: weekTop + this.remToPx(4),
      behavior: 'smooth',
    });
  }

  selectDay(date: Date) {
    this.calendarView.setSelectedDay(date);
  }

  formatDate(date: Date) {
    return format(date, 'yyyy-MM-dd');
  }

  ngOnDestroy() {
    this.todayObserver?.disconnect();
  }
}
