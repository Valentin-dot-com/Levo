import { Component, inject, input, OnInit, signal } from '@angular/core';
import { CalendarService } from '../../../services/calendars';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  Validators,
  ɵInternalFormsSharedModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CreateEvent, Event } from '../../../models/event.model';
import { DatePickerComponent } from '../../date-picker/date-picker';
import { TimePickerComponent } from '../../time-picker/time-picker';
import { CustomSelectorComponent } from '../../custom-select/custom-select';
import { FeedbackMessageService } from '../../../services/feedbackMessage';
import { format } from 'date-fns';

@Component({
  selector: 'app-event-form',
  imports: [
    CommonModule,
    ɵInternalFormsSharedModule,
    ReactiveFormsModule,
    DatePickerComponent,
    TimePickerComponent,
    CustomSelectorComponent
  ],
  templateUrl: './event-form.html',
  styleUrl: './event-form.scss',
})
export class EventFormComponent implements OnInit {
  private calendarService = inject(CalendarService);
  private feedbackService = inject(FeedbackMessageService);

  loading = signal(false);

  initialData = input<Event | null>(null);
  mode = input<'create' | 'edit'>('create');

  calendars = this.calendarService.calendars;

  eventForm = new FormGroup({
    calendar_id: new FormControl('', [Validators.required]),
    title: new FormControl('', [Validators.required, Validators.minLength(1)]),
    description: new FormControl(''),
    location: new FormControl(''),
    date: new FormControl<string | null>(null),
    scheduled_at: new FormControl(''),
  });

  ngOnInit() {
    const eventData = this.initialData();
    if (this.mode() === 'edit' && eventData) {
      this.eventForm.patchValue({
        calendar_id: eventData.calendar_id,
        title: eventData.title,
        description: eventData.description,
        location: eventData.location,
        date: eventData.date,
        scheduled_at: eventData.scheduled_at?.slice(0, 5),
      });
    } else {
      const today = format(new Date(), 'yyyy-MM-dd');

      this.eventForm.patchValue({
        date: today,
      });
    }

    const cals = this.calendars();
    if (!this.eventForm.get('calendar_id')?.value && cals?.length) {
      this.eventForm.get('calendar_id')?.setValue(cals[0].id);
    }
  }

  async onSubmit() {
    if (this.eventForm.invalid) return;

    if (this.mode() === 'create') {
      await this.onCreate();
    } else {
      await this.onUpdate();
    }
  }

  async onUpdate() {
    if (!this.initialData()) return;

    this.loading.set(true);
    this.feedbackService.setSuccess('');
    this.feedbackService.setError('');

    try {
      const formData = this.eventForm.value;
      const id = this.initialData()?.id;

      if (!id) throw new Error('Could not update event, no ID was found.');

      const updatedEvent: CreateEvent = {
        calendar_id: formData.calendar_id as string,
        title: formData.title as string,
        description: formData.description ? formData.description : null,
        location: formData.location ? formData.location : null,
        date: formData.date ? formData.date : null,
        scheduled_at: formData.scheduled_at ? `${formData.scheduled_at}:00` : null,
      };

      const oldEvent = this.initialData();

      if (!oldEvent)
        throw new Error('Could not find the event you want to update, please try again.');

      await this.calendarService.updateEvent(id, updatedEvent, oldEvent);

      this.feedbackService.setSuccess('Event updated successfully');
      setTimeout(() => this.feedbackService.setSuccess(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.feedbackService.setError(
          err.message ?? 'An error occured while trying to update event. Please try again.',
        );
      }
    } finally {
      this.loading.set(false);
    }
  }

  async onCreate() {
    if (this.eventForm.invalid) return;
    this.loading.set(true);
    this.feedbackService.setSuccess('');
    this.feedbackService.setError('');

    try {
      const formData = this.eventForm.value;
      const newEvent: CreateEvent = {
        calendar_id: formData.calendar_id as string,
        title: formData.title as string,
        description: formData.description ? formData.description : null,
        location: formData.location ? formData.location : null,
        date: formData.date ? formData.date : null,
        scheduled_at: formData.scheduled_at ? `${formData.scheduled_at}:00` : null,
      };

      await this.calendarService.createEvent(newEvent);

      this.eventForm.reset({ calendar_id: this.calendars()[0]?.id ?? '' });
      this.feedbackService.setSuccess('Event created successfully!');
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.feedbackService.setError(
          err.message ?? 'An error occured while trying to create event. Please try again.',
        );
      }
    } finally {
      this.loading.set(false);
    }
  }
}
