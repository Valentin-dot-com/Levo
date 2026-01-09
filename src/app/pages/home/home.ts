import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../services/authenticate';
import { CalendarService } from '../../services/calendars';
import { BoardService } from '../../services/boards';
import { CommonModule } from '@angular/common';
import { CalendarViewService } from '../../services/calendarView';
import { isToday } from 'date-fns';
import { RouterLink } from '@angular/router';
import { CalendarIconComponent } from '../../icons/calendarIcon';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, CalendarIconComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {
  private auth = inject(AuthService);
  private calendarService = inject(CalendarService);
  private calendarView = inject(CalendarViewService);
  private boardService = inject(BoardService);

  currentUser = this.auth.profile();
  weekdays = this.calendarView.weekDays;
  thisWeek = this.calendarView.thisWeek;
  today = computed(() => {
    const week = this.thisWeek();
    return week?.days.find(day => isToday(day.date)) || null;
  });
  calendars = this.calendarService.calendars;
  tasks = this.calendarView.tasks; 
  boards = this.boardService.boards;

  signOut() {
    this.auth.signOut();
  }
}
