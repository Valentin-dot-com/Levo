import { CommonModule, Location } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CalendarViewService } from '../../services/calendarView';
import { format, getISOWeek, isValid, parse } from 'date-fns';
import { SharedIconComponent } from '../../icons/sharedIcon';
import { CalendarService } from '../../services/calendars';
import { ArrowLeftIconComponent } from '../../icons/arrowLeftIcon';
import { Event } from '../../models/event.model';
import { EditEventComponent } from '../edit-event/edit-event';
import { ActivatedRoute } from '@angular/router';
import { FeedbackMessageService } from '../../services/feedbackMessage';

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
export class DayComponent implements OnDestroy, OnInit {
  private calendarView = inject(CalendarViewService);
  private calendarService = inject(CalendarService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private feedbackService = inject(FeedbackMessageService);

  calendarIds = this.calendarService.calendarIds;
  day = this.calendarView.selectedDay;
  events = this.calendarView.eventsForSelectedDay;

  newEventTitle = signal('');
  selectedEvent = signal<Event | null>(null);

  isRouted = computed(() => {
    return this.route.snapshot.paramMap.has('dayId');
  })

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
    if (!this.isRouted()) return;

    const dayId = this.route.snapshot.paramMap.get('dayId');
    if (!dayId) return;

    const parsed = parse(dayId, 'yyyy-MM-dd', new Date());

    if (!isValid(parsed)) return;

    this.calendarView.setSelectedDay(parsed);
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
      this.feedbackService.setError('Something went wrong, please try again.');
      return;
    }

    if (this.newEventTitle().length === 0) {
      this.feedbackService.setError('You need to enter atleast 1 carachter.');
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
      this.feedbackService.setSuccess('New event created successfully');
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.feedbackService.setError(err.message ?? 'An error occured, could not create event.');
      } else {
        this.feedbackService.setError('An error occured, could not create event.');
      }
    }
  }

  openEditEvent(event: Event) {
    this.selectedEvent.set(event);
  }

  closeEdit() {
    this.selectedEvent.set(null);
  }

  close() {
    if (this.isRouted()) {
      this.location.back();
    } else {
      this.calendarView.setSelectedDay(null);
    }
  }

  ngOnDestroy(): void {
    this.selectedEvent.set(null);
  }
}
