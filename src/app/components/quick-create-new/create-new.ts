import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewBoardComponent } from '../forms/new-board/new-board';
import { EventFormComponent } from '../forms/new-event/event-form';
import { CloseBtnComponent } from '../close-btn/close-btn';

type Choice = 'event' | 'board';

@Component({
  selector: 'app-create-new',
  imports: [CommonModule, EventFormComponent, NewBoardComponent, CloseBtnComponent],
  templateUrl: './create-new.html',
  styleUrl: './create-new.scss',
})
export class CreateNewComponent {
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
}
