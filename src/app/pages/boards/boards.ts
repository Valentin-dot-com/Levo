import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BoardService } from '../../services/boards';
import { CalendarService } from '../../services/calendars';
import { SharedIconComponent } from '../../icons/sharedIcon';
import { NewBoardComponent } from '../../components/forms/new-board/new-board';

@Component({
  selector: 'app-boards',
  imports: [CommonModule, RouterLink, SharedIconComponent, NewBoardComponent],
  templateUrl: './boards.html',
  styleUrl: './boards.scss',
})
export class BoardsComponent {
  private boardsService = inject(BoardService);
  private calendarService = inject(CalendarService);

  boards = this.boardsService.boards;
  loading = signal(false);
  openCreate = signal(false);

  getCalendar(calId: string) {
    const calendar = this.calendarService.calendars().find((cal) => cal.id === calId);
    return calendar || null;
  }

  openCreateNew() {
    this.openCreate.set(true);
  }

  close() {
    this.openCreate.set(false);
    this.openCreate.set(false);
  }
}
