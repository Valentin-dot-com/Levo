import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewBoardComponent } from '../forms/new-board/new-board';
import { AddIconComponent } from '../../icons/addIcon';
import { EventFormComponent } from '../forms/new-event/event-form';

type Choice = 'event' | 'board';

@Component({
  selector: 'app-create-new',
  imports: [CommonModule, EventFormComponent, NewBoardComponent, AddIconComponent],
  templateUrl: './create-new.html',
  styleUrl: './create-new.scss',
})
export class CreateNewComponent {
  // private calendarService = inject(CalendarService);

  // loading = signal(false);
  // errorMessage = signal('');
  // successMessage = signal('');

  closed = output<void>();

  close() {
    this.closed.emit();
  }

  context = input();

  choices: Choice[] = ['event', 'board'];
  currentChoice = signal<Choice>('event'); // Set default as "context"

  setCurrentChoice(choice: Choice) {
    this.currentChoice.set(choice);
  }

  // async createEvent(event: CreateEvent) {
  //   this.loading.set(true);
  //   this.errorMessage.set('');
  //   this.successMessage.set('');

  //   try {
  //     await this.calendarService.createEvent(event);
  //     this.successMessage.set('Event created successfully!');
  //   } catch (err: unknown) {
  //     if (err instanceof Error) {
  //       this.errorMessage.set(
  //         err.message ?? 'An error occured while trying to create event. Please try again.',
  //       );
  //     } else {
  //       this.errorMessage.set('An error occured while trying to create event. Please try again.');
  //     }
  //   } finally {
  //     this.loading.set(false);
  //   }
  // }
}
