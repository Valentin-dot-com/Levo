import {
  Component,
  inject,
  signal,
  ViewChild,
  ElementRef,
  OnDestroy,
  input,
  output,
} from '@angular/core';
import { format } from 'date-fns';
import { CalendarViewService } from '../../../services/calendarView';
import { CommonModule } from '@angular/common';
import { CalendarMonth } from '../../../models/calendar.model';
import { LoaderComponent } from '../../loader/loader';
import { RouterLink } from "@angular/router";
import { CalendarService } from '../../../services/calendars';
import { SharedIconComponent } from '../../../icons/sharedIcon';

@Component({
  selector: 'app-weekly-calendar',
  imports: [CommonModule, LoaderComponent, RouterLink, SharedIconComponent],
  templateUrl: './weekly-calendar.html',
  styleUrls: ['./weekly-calendar.scss'],
})
export class WeeklyCalendarComponent implements OnDestroy {
  calendarView = inject(CalendarViewService);
  calendarService = inject(CalendarService);

  monthsToRender = input.required<CalendarMonth[]>();

  nearTop = output<void>();
  nearBottom = output<void>();

  private readonly THRESHOLD = 300;
  private isEmittingTop = false;
  private isEmittingBottom = false;
  private todayObserver?: IntersectionObserver;

  readonly currentMonth = this.calendarView.monthName;
  readonly currentYear = this.calendarView.currentYear;
  readonly loading = signal(true);
  readonly isBtnScrolling = signal(false);
  readonly isTodayVisible = signal(true);

  private hasInitialScroll = false;

  @ViewChild('scrollContainer', { static: true })
  container!: ElementRef<HTMLElement>;

  @ViewChild('todayAnchor')
  set todayAnchor(el: ElementRef<HTMLElement> | undefined) {
    if (!el || this.hasInitialScroll) return;

    const dayEl = el.nativeElement.closest('.day-card');

    if (!dayEl) return;

    const container = this.container.nativeElement;

    const weekTop =
      dayEl.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop;

    container.scrollTo({
      top: weekTop - this.remToPx(3),
      behavior: 'auto',
    });
    this.loading.set(false);

    setTimeout(() => {
      this.hasInitialScroll = true;
    }, 400);

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
  }

  scrollToToday() {
    this.isBtnScrolling.set(true);
    requestAnimationFrame(() => {
      const el = this.container.nativeElement.querySelector('[data-today]');

      if (!el) return;

      const dayEl = el.closest('.day-card');

      if (!dayEl) return;

      const container = this.container.nativeElement;

      const weekTop =
        dayEl.getBoundingClientRect().top -
        container.getBoundingClientRect().top +
        container.scrollTop;

      container.scrollTo({
        top: weekTop - this.remToPx(3),
        behavior: 'smooth',
      });

      this.isBtnScrolling.set(false);
    });
  }

  private remToPx(rem: number): number {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
  }

  getCalendar(calId: string) {
    const calendar = this.calendarService.calendars().find((cal) => cal.id === calId);
    return calendar || null;
  }

  get weekDayNames() {
    return this.calendarView.weekDays;
  }

  selectDay(date: Date) {
    this.calendarView.setSelectedDay(date);
  }

  formatDate(date: Date) {
    return format(date, 'yyyy-MM-dd');
  }

  formatTime(time: string) {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    if (hours === undefined || minutes === undefined) return '';
    return `${hours}:${minutes}`;
  }

  ngOnDestroy() {
    this.todayObserver?.disconnect();
  }
}
