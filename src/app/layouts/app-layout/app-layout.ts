import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CalendarService } from '../../services/calendars';
import { BoardService } from '../../services/boards';
import { CalendarViewService } from '../../services/calendarView';
import { HomeIconComponent } from '../../icons/homeIcon';
import { AddIconComponent } from '../../icons/addIcon';
import { CalendarIconComponent } from '../../icons/calendarIcon';
import { BoardIconComponent } from '../../icons/boardIcon';
import { ProfileIconComponent } from '../../icons/profileIcon';
import { CreateNewComponent } from '../../components/quick-create-new/create-new';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    HomeIconComponent,
    AddIconComponent,
    CalendarIconComponent,
    BoardIconComponent,
    ProfileIconComponent,
    CreateNewComponent
],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss',
})
export class AppLayoutComponent implements OnInit {
  private calendarService = inject(CalendarService);
  private calendarView = inject(CalendarViewService);
  private boardService = inject(BoardService);

  initError = signal<string | null>(null);
  openCreateNew = signal(false);

  toggleCreateNew() {
    this.openCreateNew.update(value => !value);
  }

  async ngOnInit(): Promise<void> {
    try {
      await this.calendarService.initCalendarData();
      await this.calendarView.initialize();
      await this.boardService.fetchUserBoards();
    } catch (error) {
      console.error('Failed to initialize app data:', error);
      this.initError.set('Failed to load your data. Please refresh the page.');
    }
  }
}
