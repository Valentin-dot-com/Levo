import { CommonModule } from '@angular/common';
import { Component, inject, output, signal } from '@angular/core';
import { CalendarService } from '../../services/calendars';
import { Calendar, CreateCalendar } from '../../models/calendar.model';
import { AuthService } from '../../services/authenticate';
import { UUID } from '../../models/primitives.model';
import { FeedbackMessageService } from '../../services/feedbackMessage';
import { DeleteIconComponent } from '../../icons/deleteIcon';
import { CloseBtnComponent } from '../close-btn/close-btn';

@Component({
  selector: 'app-edit-calendars',
  imports: [CommonModule, DeleteIconComponent, CloseBtnComponent],
  templateUrl: './edit-calendars.html',
  styleUrl: './edit-calendars.scss',
})
export class EditCalendarsComponent {
  private calendarService = inject(CalendarService);
  private auth = inject(AuthService);
  private feedbackMsg = inject(FeedbackMessageService);

  currentUser = this.auth.profile;
  calendars = this.calendarService.calendars;

  newCalendarTitle = signal('');
  isNewCalShared = signal(false);

  closed = output<void>();

  close() {
    this.closed.emit();
  }

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
    const userId = this.currentUser()?.user_id;

    if (!title || !userId) return;

    const payload: CreateCalendar = {
      owner_id: userId,
      name: title,
      is_shared: this.isNewCalShared(),
    };

    try {
      this.calendarService.createCalendar(payload);

      this.newCalendarTitle.set('');
      this.isNewCalShared.set(false);
      this.feedbackMsg.success.set('New calendar created successfully');
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.feedbackMsg.error.set(err.message ?? 'An error occured, could not create calendar.');
      } else {
        this.feedbackMsg.error.set('An error occured, could not create calendar.');
      }
    }
  }

  async leaveCalendar(calId: UUID) {
    const userId = this.currentUser()?.user_id;

    if (!calId || !userId) return;

    try {
      await this.calendarService.leaveCalendar(calId, userId);

      this.feedbackMsg.success.set('You have successfully left the calendar');
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.feedbackMsg.error.set(err.message ?? 'An error occured, could not leave calendar.');
      } else {
        this.feedbackMsg.error.set('An error occured, could not leave calendar.');
      }
    }
  }

  async deleteCalendar(calId: UUID) {
    if (!calId) return;

    try {
      await this.calendarService.deleteCalendar(calId);

      this.feedbackMsg.success.set('Calendar deleted successfully');
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.feedbackMsg.error.set(err.message ?? 'An error occured, could not delete calendar.');
      } else {
        this.feedbackMsg.error.set('An error occured, could not delete calendar.');
      }
    }
  }
}
