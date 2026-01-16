import { Component, inject, signal } from '@angular/core';
import { CalendarService } from '../../../services/calendars';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  Validators,
  ɵInternalFormsSharedModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CreateEvent } from '../../../models/event.model';
import { DatePickerComponent } from '../../date-picker/date-picker';
import { TimePickerComponent } from '../../time-picker/time-picker';

@Component({
  selector: 'app-new-event',
  imports: [
    CommonModule,
    ɵInternalFormsSharedModule,
    ReactiveFormsModule,
    DatePickerComponent,
    TimePickerComponent
  ],
  templateUrl: './new-event.html',
  styleUrl: './new-event.scss',
})
export class NewEventComponent {
  private calendarService = inject(CalendarService);

  errorMessage = signal('');
  successMessage = signal('');
  loading = signal(false);
  calendars = this.calendarService.calendars;

  newEventForm = new FormGroup({
    calendar_id: new FormControl(this.calendars()[0].id, [Validators.required]),
    title: new FormControl('', [Validators.required, Validators.minLength(1)]),
    description: new FormControl(''),
    location: new FormControl(''),
    date: new FormControl<string | null>(null),
    scheduled_at: new FormControl(''),
  });

  async onCreate() {
    if (this.newEventForm.invalid) return;
    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const formData = this.newEventForm.value;
      const newEvent: CreateEvent = {
        calendar_id: formData.calendar_id as string,
        title: formData.title as string,
        description: formData.description ? formData.description : null,
        location: formData.location ? formData.location : null,
        date: formData.date ? formData.date : null,
        scheduled_at: formData.scheduled_at ? `${formData.scheduled_at}:00`: null,
      };

      await this.calendarService.createEvent(newEvent);

      this.newEventForm.reset();
      this.successMessage.set('Event created successfully!');
      setTimeout(() => this.successMessage.set(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.errorMessage.set(
          err.message ?? 'An error occured while trying to create event. Please try again.'
        );
      }
    } finally {
      this.loading.set(false);
    }
  }
}
