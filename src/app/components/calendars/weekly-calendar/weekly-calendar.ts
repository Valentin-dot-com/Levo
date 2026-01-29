import {
  Component,
  inject,
  signal,
  ViewChild,
  ElementRef,
  OnDestroy,
  input,
  output,
  HostListener,
} from '@angular/core';
import { format } from 'date-fns';
import { CalendarViewService } from '../../../services/calendarView';
import { CommonModule } from '@angular/common';
import { CalendarDay, CalendarMonth } from '../../../models/calendar.model';
import { LoaderComponent } from '../../loader/loader';
import { RouterLink } from '@angular/router';
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
  readonly focusedDay = signal<Date | null>(null);

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
      top: weekTop - this.remToPx(3.5),
      behavior: 'auto',
    });
    this.loading.set(false);

    setTimeout(() => {
      this.hasInitialScroll = true;
    }, 400);

    requestAnimationFrame(() => {
      this.initTodayObserver(el.nativeElement);
    });
  }

  private initTodayObserver(el: HTMLElement) {
    this.todayObserver?.disconnect();

    this.todayObserver = new IntersectionObserver(
      ([entry]) => {
        this.isTodayVisible.set(entry.isIntersecting);
      },
      {
        root: this.container.nativeElement,
        threshold: 0.1,
      },
    );

    this.todayObserver.observe(el);
  }

  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.day-card')) {
      return;
    }

    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      return;
    }

    event.preventDefault();

    const currentDate = this.focusedDay() || this.calendarView.selectedDay() || new Date();
    let newDay: Date | null = null;

    switch (event.key) {
      case 'ArrowUp':
        newDay = new Date(currentDate);
        newDay.setDate(currentDate.getDate() - 1);
        break;
      case 'ArrowDown':
        newDay = new Date(currentDate);
        newDay.setDate(currentDate.getDate() + 1);
        break;
      // case 'ArrowUp':
      //   newDay = new Date(currentDate);
      //   newDay.setDate(currentDate.getDate() - 7);
      //   break;
      // case 'ArrowDown':
      //   newDay = new Date(currentDate);
      //   newDay.setDate(currentDate.getDate() + 7);
      //   break;
      case 'Home':
        newDay = new Date(); // Today
        this.scrollDayIntoView(newDay);
        return;
    }

    if (newDay) {
      this.focusedDay.set(newDay);
      this.scrollDayIntoView(newDay!);
    }
  }

  scrollDayIntoView(date: Date) {
    const dateStr = this.formatDate(date);
    const dayElement = this.container.nativeElement.querySelector(
      `[data-date="${dateStr}"]`,
    ) as HTMLElement;

    if (dayElement) {
      const container = this.container.nativeElement;
      const dayTop =
        dayElement.getBoundingClientRect().top -
        container.getBoundingClientRect().top +
        container.scrollTop;

      container.scrollTo({
        top: dayTop - this.remToPx(3.5),
        behavior: 'smooth',
      });

      // Focus after DOM updates
      this.focusActiveDayButton();
    }
  }

  private focusActiveDayButton() {
    setTimeout(() => {
      const active = this.container.nativeElement.querySelector(
        '.day-card[tabindex="0"]',
      ) as HTMLElement | null;
      if (active) {
        try {
          active.focus({ preventScroll: true });
        } catch {
          active.focus();
        }
      }
    });
  }

  getDayTabIndex(day: CalendarDay): number {
    const focused = this.focusedDay();

    // If there's a focused day from keyboard navigation, only it should be tabbable
    if (focused) {
      return focused.toDateString() === day.date.toDateString() ? 0 : -1;
    }

    // Otherwise, only today should be tabbable
    return day.isToday ? 0 : -1;
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
        top: weekTop - this.remToPx(3.5),
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
