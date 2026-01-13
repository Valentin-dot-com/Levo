import { Component, inject  } from '@angular/core';
import { CalendarService } from '../../../services/calendars';
import { BoardService } from '../../../services/boards';
import { CalendarViewService } from '../../../services/calendarView';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-new-board-item',
  imports: [CommonModule],
  templateUrl: './new-board-item.html',
  styleUrl: './new-board-item.scss',
})
export class NewBoardItemComponent {
  private calendarService = inject(CalendarService);
  private calendarView = inject(CalendarViewService);
  private boardService = inject(BoardService);
}
