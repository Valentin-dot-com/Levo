import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../services/authenticate';
import { CalendarService } from '../../services/calendars';
import { BoardService } from '../../services/boards';
import { CommonModule } from '@angular/common';
import { CalendarViewService } from '../../services/calendarView';
import { compareAsc, format, isToday, parseISO } from 'date-fns';
import { RouterLink } from '@angular/router';
import { AddIconComponent } from '../../icons/addIcon';
import { SharedIconComponent } from '../../icons/sharedIcon';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, AddIconComponent, SharedIconComponent],
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
    return week?.days.find((day) => isToday(day.date)) || null;
  });

  events = computed(() => {
    const eventsForToday =
      this.calendarView.events().filter((event) => event.date && isToday(event.date)) || [];

    if (eventsForToday.length === 0) return eventsForToday;

    return [...eventsForToday].sort((a, b) => {
      if (!a.scheduled_at && !b.scheduled_at) return 0;
      if (!a.scheduled_at) return 1;
      if (!b.scheduled_at) return -1;

      // Only reaches this if both have a scheduled time
      return compareAsc(parseISO(a.scheduled_at), parseISO(b.scheduled_at));
    });
  });

  boards = this.boardService.boards;

  getCalendar(calId: string) {
    const calendar = this.calendarService.calendars().find((cal) => cal.id === calId);
    return calendar || null;
  }

  formatTime(time: string) {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    if (hours === undefined || minutes === undefined) return '';
    return `${hours}:${minutes}`;
  }

  signOut() {
    this.auth.signOut();
  }
}
