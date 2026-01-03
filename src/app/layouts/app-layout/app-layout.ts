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

  public initializationError: unknown = null;
  public initializationErrorMessage = '';

  async ngOnInit(): Promise<void> {
    try {
      await Promise.all([
        this.calendarService.fetchAll(),
        this.boardService.fetchUserBoards(),
      ]);
      // Clear any previous initialization error on successful load
      this.initializationError = null;
      this.initializationErrorMessage = '';
    } catch (error) {
      this.initializationError = error;
      this.initializationErrorMessage =
        'Failed to load initial application data. Some features may not be available.';
      console.error('Failed to initialize app layout data', error);
      // Provide immediate feedback to the user that initialization failed
      window.alert(this.initializationErrorMessage);
    }
  }
}
