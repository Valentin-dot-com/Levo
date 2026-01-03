import { Component, inject, OnInit, signal } from '@angular/core';
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

  initError = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    try {
      await this.calendarService.fetchAll();
      await this.boardService.fetchUserBoards();
    } catch (error) {
      console.error('Failed to initialize app data:', error);
      this.initError.set('Failed to load your data. Please refresh the page.');
    }
  }
}
