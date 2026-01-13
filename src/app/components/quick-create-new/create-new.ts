import { Component, inject, input, signal  } from '@angular/core';
import { CalendarService } from '../../services/calendars';
import { BoardService } from '../../services/boards';
import { CalendarViewService } from '../../services/calendarView';
import { CommonModule } from '@angular/common';
import { NewTaskComponent } from '../forms/new-task/new-task';
import { NewBoardComponent } from '../forms/new-board/new-board';

type Choice = 'task' | 'board';

@Component({
  selector: 'app-create-new',
  imports: [CommonModule, NewTaskComponent, NewBoardComponent],
  templateUrl: './create-new.html',
  styleUrl: './create-new.scss',
})
export class CreateNewComponent {
  private calendarService = inject(CalendarService);
  private calendarView = inject(CalendarViewService);
  private boardService = inject(BoardService);

  context = input();

  choices: Choice[] = ['task', 'board'];
  currentChoice = signal<Choice>('task'); // Set default as "context"

  setCurrentChoice(choice: Choice) {
    this.currentChoice.set(choice);
  }
}
