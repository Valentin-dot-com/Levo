import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../services/authenticate';
import { CalendarService } from '../../services/calendars';
import { BoardService } from '../../services/boards';
import { CommonModule } from '@angular/common';
import { CalendarViewService } from '../../services/calendarView';
import { compareAsc, format, isToday, parseISO } from 'date-fns';
import { Router, RouterLink } from '@angular/router';
import { AddIconComponent } from '../../icons/addIcon';
import { SharedIconComponent } from '../../icons/sharedIcon';
import { EditEventComponent } from '../../components/edit-event/edit-event';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, AddIconComponent, SharedIconComponent, EditEventComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {
  private auth = inject(AuthService);
  private calendarService = inject(CalendarService);
  private calendarView = inject(CalendarViewService);
  private boardService = inject(BoardService);
  private router = inject(Router);

  currentUser = this.auth.profile;
  weekdays = this.calendarView.weekDays;
  thisWeek = this.calendarView.thisWeek;

  selectedEvent = signal<Event | null>(null);

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

  formatDate(date: Date) {
    return format(date, 'yyyy-MM-dd');
  }

  openEditEvent(event: Event) {
    console.log('EVent clicked');
    this.selectedEvent.set(event);
  }

  closeEdit() {
    this.selectedEvent.set(null);
  }

  goToDay(date: Date) {
    // this.calendarView.setSelectedDay(date);
    const selected = format(date, 'yyyy-MM-dd');
    this.router.navigate(['/day', selected]);
  }
}
