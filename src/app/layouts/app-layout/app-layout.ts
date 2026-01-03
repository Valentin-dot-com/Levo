import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CalendarService } from '../../services/calendars';
import { BoardService } from '../../services/boards';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss',
})
export class AppLayoutComponent implements OnInit {
  private calendarService = inject(CalendarService);
  private boardService = inject(BoardService);

  ngOnInit() {
    this.calendarService.fetchAll();
    this.boardService.fetchUserBoards();
  }
}
