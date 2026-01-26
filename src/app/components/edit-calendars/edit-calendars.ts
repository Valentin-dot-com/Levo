import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { CalendarService } from '../../services/calendars';
import { Calendar, CreateCalendar } from '../../models/calendar.model';
import { AuthService } from '../../services/authenticate';
import { UUID } from '../../models/primitives.model';

@Component({
  selector: 'app-edit-calendars',
  imports: [CommonModule],
  templateUrl: './edit-calendars.html',
  styleUrl: './edit-calendars.scss',
})
export class EditCalendarsComponent {
  private calendarService = inject(CalendarService);
  private auth = inject(AuthService);

  currentUser = this.auth.profile;
  calendars = this.calendarService.calendars;

  newCalendarTitle = signal('');
  isNewCalShared = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  isOwner(calendar: Calendar): boolean {
    const ownerId = calendar.owner_id;
    const userId = this.currentUser()?.user_id;

    if (!ownerId || !userId) return false;

    if (ownerId === userId) {
      return true;
    } else {
      return false;
    }
  }

  async createCalendar() {
    const title = this.newCalendarTitle().trim();
    if (!title) return;

    const payload: CreateCalendar = {
      name: title,
      is_shared: this.isNewCalShared(),
    };

    try {
      this.calendarService.createCalendar(payload);

      this.newCalendarTitle.set('');
      this.isNewCalShared.set(false);
      this.successMessage.set('New calendar created successfully');
      setTimeout(() => this.successMessage.set(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.errorMessage.set(err.message ?? 'An error occured, could not create calendar.');
      } else {
        this.errorMessage.set('An error occured, could not create calendar.');
      }
    }
  }

  async leaveCalendar(calId: UUID) {
    const userId = this.currentUser()?.user_id;

    if (!calId || !userId) return;

    try {
      await this.calendarService.leaveCalendar(calId, userId);

      this.successMessage.set('You have successfully left the calendar');
      setTimeout(() => this.successMessage.set(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.errorMessage.set(err.message ?? 'An error occured, could not leave calendar.');
      } else {
        this.errorMessage.set('An error occured, could not leave calendar.');
      }
    }
  }

  async deleteCalendar(calId: UUID) {
    if (!calId) return;

    try {
      await this.calendarService.deleteCalendar(calId);

      this.successMessage.set('Calendar deleted successfully');
      setTimeout(() => this.successMessage.set(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.errorMessage.set(err.message ?? 'An error occured, could not delete calendar.');
      } else {
        this.errorMessage.set('An error occured, could not delete calendar.');
      }
    }
  }
}
