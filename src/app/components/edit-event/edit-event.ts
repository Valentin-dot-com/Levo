import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  input,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { Event } from '../../models/event.model';
import { EventFormComponent } from '../forms/new-event/event-form';
import { CalendarService } from '../../services/calendars';
import { AddIconComponent } from '../../icons/addIcon';

@Component({
  selector: 'app-edit-event',
  imports: [CommonModule, EventFormComponent, AddIconComponent],
  templateUrl: './edit-event.html',
  styleUrl: './edit-event.scss',
})
export class EditEventComponent implements AfterViewInit {
  private calendarService = inject(CalendarService);

  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;

  errorMessage = signal('');
  event = input<Event | null>(null);
  closed = output<void>();

  ngAfterViewInit(): void {
    if (this.event() && this.dialog) {
      this.dialog.nativeElement.showModal();
    }
  }

  close() {
    this.closed.emit();
  }

  async delete() {
    const oldEvent = this.event();

    if (!oldEvent || oldEvent === null) {
      this.errorMessage.set('No event found, could not delete.');
    }

    try {
      await this.calendarService.deleteEvent(oldEvent!);
      this.close();
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.errorMessage.set(err.message ?? 'An error occured, please try again.');
      } else {
        this.errorMessage.set('An error occured, please try again');
      }
    }
  }
}
