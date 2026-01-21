import { CommonModule, Location } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CalendarViewService } from '../../services/calendarView';
import { format, getISOWeek, parse } from 'date-fns';
import { SharedIconComponent } from '../../icons/sharedIcon';
import { CalendarService } from '../../services/calendars';
import { ArrowLeftIconComponent } from '../../icons/arrowLeftIcon';
import { Event } from '../../models/event.model';
import { EditEventComponent } from '../edit-event/edit-event';

interface DayDetails {
  number: string;
  weekday: string;
  month: string;
  year: string;
  weeknumber: string;
}

@Component({
  selector: 'app-day',
  imports: [CommonModule, SharedIconComponent, ArrowLeftIconComponent, EditEventComponent],
  templateUrl: './day.html',
  styleUrl: './day.scss',
})
export class DayComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private calendarView = inject(CalendarViewService);
  private calendarService = inject(CalendarService);
  private destroyRef = inject(DestroyRef);

  calendarIds = this.calendarService.calendarIds;
  day = this.calendarView.selectedDay;
  events = this.calendarView.eventsForSelectedDay;

  errorMessage = signal('');
  successMessage = signal('');
  loading = signal(true);
  newEventTitle = signal('');
  selectedEvent = signal<Event | null>(null);

  dayDetails = computed<DayDetails | null>(() => {
    const selectedDay = this.day();
    if (!selectedDay) return null;

    return {
      number: format(selectedDay, 'd'),
      weekday: format(selectedDay, 'EEEE'),
      month: format(selectedDay, 'MMMM'),
      year: selectedDay.getFullYear().toString(),
      weeknumber: getISOWeek(selectedDay).toString(),
    };
  });

  ngOnInit(): void {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const dayId = params['dayId'];

      if (!dayId) return;

      this.loadDay(dayId);
    });

    this.destroyRef.onDestroy(() => {
      this.calendarView.setSelectedDay(null);
    });
  }

  private loadDay(dayId: string): void {
    this.loading.set(true);

    try {
      const parsed = this.parseDate(dayId);

      if (parsed) {
        this.calendarView.setSelectedDay(parsed);
      }
    } finally {
      this.loading.set(false);
    }
  }

  private parseDate(dateString: string): Date | null {
    return parse(dateString, 'yyyy-MM-dd', new Date());
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

  async createEvent() {
    const calendarId = this.calendarIds()[0];
    if (!calendarId) {
      this.errorMessage.set('Something went wrong, please try again.');
      return;
    }

    const date = this.day() ? format(this.day()!, 'yyyy-MM-dd') : null;

    try {
      await this.calendarService.createEvent({
        calendar_id: calendarId,
        title: this.newEventTitle(),
        description: null,
        location: null,
        date: date,
        scheduled_at: null,
      });

      this.newEventTitle.set('');
      this.successMessage.set('New event created successfully');
      setTimeout(() => this.successMessage.set(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.errorMessage.set(err.message ?? 'An error occured, could not create event.');
      } else {
        this.errorMessage.set('An error occured, could not create event.');
      }
    }
  }

  openEditEvent(event: Event) {
    console.log('EVent clicked');
    this.selectedEvent.set(event);
  }

  closeEdit() {
    this.selectedEvent.set(null);
  }

  goBack() {
    this.location.back();
  }
}
