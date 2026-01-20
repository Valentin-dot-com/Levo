import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CalendarViewService } from "../../services/calendarView";

@Component({
  selector: 'app-day',
  imports: [CommonModule],
  templateUrl: './day.html',
  styleUrl: './day.scss',
})
export class DayComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private calendarView = inject(CalendarViewService);

  day = this.calendarView.selectedDay;
  events = this.calendarView.eventsForSelectedDay;

  dayId = signal('');
  loading = signal(true);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.dayId.set(params['dayId']);
      this.loadDay();
    });
  }

  loadDay() {
    this.loading.set(true);
  }
}
