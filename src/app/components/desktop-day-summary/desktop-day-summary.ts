import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { CalendarViewService } from '../../services/calendarView';
import { format, getISOWeek } from 'date-fns';
import { SharedIconComponent } from '../../icons/sharedIcon';
import { CalendarService } from '../../services/calendars';
import { Event } from '../../models/event.model';
import { EditEventComponent } from '../edit-event/edit-event';
import { FeedbackMessageService } from '../../services/feedbackMessage';

interface DayDetails {
  number: string;
  weekday: string;
  month: string;
  year: string;
  weeknumber: string;
}

@Component({
  selector: 'app-desktop-day-summary',
  imports: [CommonModule, SharedIconComponent, EditEventComponent],
  templateUrl: './desktop-day-summary.html',
  styleUrl: './desktop-day-summary.scss',
})
export class DesktopDaySummaryComponent{
  private calendarView = inject(CalendarViewService);
  private calendarService = inject(CalendarService);
  private feedbackService = inject(FeedbackMessageService);

  calendarIds = this.calendarService.calendarIds;
  day = this.calendarView.selectedDay;
  events = this.calendarView.eventsForSelectedDay;

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
    console.log('EVent clicked');
    this.selectedEvent.set(event);
  }

  closeEdit() {
    this.selectedEvent.set(null);
  }

}
