import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/authenticate';
import { CalendarService } from '../../services/calendars';
import { BoardService } from '../../services/boards';
import { CommonModule } from '@angular/common';
import { CalendarViewService } from '../../services/calendarView';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {
  private auth = inject(AuthService);
  private calendarService = inject(CalendarService);
  private calendarView = inject(CalendarViewService);
  private boardService = inject(BoardService);

  calendars = this.calendarService.calendars;
  tasks = this.calendarView.tasks;
  boards = this.boardService.boards;

  signOut() {
    this.auth.signOut();
  }
}
