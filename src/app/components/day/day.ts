import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { CalendarViewService } from '../../services/calendarView';
import { format, getISOWeek } from 'date-fns';
import { SharedIconComponent } from '../../icons/sharedIcon';
import { CalendarService } from '../../services/calendars';
import { ArrowLeftIconComponent } from '../../icons/arrowLeftIcon';
import { Event } from '../../models/event.model';
import { EditEventComponent } from '../edit-event/edit-event';
import { Router } from '@angular/router';

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
export class DayComponent implements OnDestroy {
  private calendarView = inject(CalendarViewService);
  private calendarService = inject(CalendarService);
  private router = inject(Router);

  calendarIds = this.calendarService.calendarIds;
  day = this.calendarView.selectedDay;
  events = this.calendarView.eventsForSelectedDay;

  errorMessage = signal('');
  successMessage = signal('');
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

    if (this.newEventTitle().length === 0) {
      this.errorMessage.set('You need to enter atleast 1 carachter.');
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

  close() {
    this.calendarView.setSelectedDay(null);
  }

  ngOnDestroy(): void {
    this.router.navigate([], {
      queryParams: { day: null },
      queryParamsHandling: 'merge',
    });
    this.selectedEvent.set(null);
  }
}
