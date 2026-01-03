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

  async ngOnInit(): Promise<void> {
    try {
      await Promise.all([
        this.calendarService.fetchAll(),
        this.boardService.fetchUserBoards(),
      ]);
    } catch (error) {
      console.error('Failed to initialize app layout data', error);
    }
  }
}
