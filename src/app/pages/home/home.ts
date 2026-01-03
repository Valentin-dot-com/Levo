import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/authenticate';
import { CalendarService } from '../../services/calendars';
import { BoardService } from '../../services/boards';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {
  private auth = inject(AuthService);
  private calendarService = inject(CalendarService);
  private boardService = inject(BoardService);


  calendars = this.calendarService.calendars;
  tasks = this.calendarService.tasks;
  boards = this.boardService.boards;

  signOut() {
    this.auth.signOut();
  }
}
