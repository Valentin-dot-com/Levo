import { Component, inject  } from '@angular/core';
import { CalendarService } from '../../../services/calendars';
import { BoardService } from '../../../services/boards';
import { CalendarViewService } from '../../../services/calendarView';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-new-board',
  imports: [CommonModule],
  templateUrl: './new-board.html',
  styleUrl: './new-board.scss',
})
export class NewBoardComponent {
  private calendarService = inject(CalendarService);
  private calendarView = inject(CalendarViewService);
  private boardService = inject(BoardService);
}
