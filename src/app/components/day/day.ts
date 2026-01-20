import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CalendarViewService } from '../../services/calendarView';
import { format } from 'date-fns';
import { SharedIconComponent } from '../../icons/sharedIcon';
import { CalendarService } from '../../services/calendars';

interface DayDetails {
  number: string;
  weekday: string;
  month: string;
  year: string;
}

@Component({
  selector: 'app-day',
  imports: [CommonModule, SharedIconComponent],
  templateUrl: './day.html',
  styleUrl: './day.scss',
})
export class DayComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private calendarView = inject(CalendarViewService);
  private calendarService = inject(CalendarService);
  private destroyRef = inject(DestroyRef);

  readonly day = this.calendarView.selectedDay;
  readonly events = this.calendarView.eventsForSelectedDay;

  readonly loading = signal(true);
  private readonly dayId = signal<string>('');

  readonly dayDetails = computed<DayDetails | null>(() => {
    const selectedDay = this.day();
    if (!selectedDay) return null;

    return {
      number: format(selectedDay, 'd'),
      weekday: format(selectedDay, 'EEEE'),
      month: format(selectedDay, 'MMMM'),
      year: selectedDay.getFullYear().toString(),
    };
  });

  ngOnInit(): void {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const newDayId = params['dayId'];
      if (newDayId !== this.dayId()) {
        this.dayId.set(newDayId);
        this.loadDay();
      }
    });
  }

  private loadDay(): void {
    this.loading.set(true);

    try {
      if (this.day()) {
        this.loading.set(false);
        return;
      }

      const id = this.dayId();
      if (!id) {
        this.loading.set(false);
        return;
      }

      const parsed = this.parseDate(id);
      if (parsed) {
        this.calendarView.setSelectedDay(parsed);
      }
    } finally {
      this.loading.set(false);
    }
  }

  private parseDate(dateString: string): Date | null {
    const parsed = new Date(dateString);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  formatTime(time: string) {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    if (hours === undefined || minutes === undefined) return '';
    return `${hours}:${minutes}`;
  }

  getCalendar(calId: string) {
    const calendar = this.calendarService.calendars().find((cal) => cal.id === calId);
    return calendar || null;
  }
}
