import { Component, inject, signal } from '@angular/core';
import { CalendarService } from '../../../services/calendars';
import { BoardService } from '../../../services/boards';
import { CalendarViewService } from '../../../services/calendarView';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  Validators,
  ɵInternalFormsSharedModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CreateTask } from '../../../models/task';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-new-task',
  imports: [
    CommonModule,
    ɵInternalFormsSharedModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatIconModule,
  ],
  templateUrl: './new-task.html',
  styleUrl: './new-task.scss',
})
export class NewTaskComponent {
  private calendarService = inject(CalendarService);
  private calendarView = inject(CalendarViewService);
  private boardService = inject(BoardService);

  errorMessage = signal('');
  loading = signal(false);
  calendars = this.calendarService.calendars;

  newTaskForm = new FormGroup({
    calendar_id: new FormControl(this.calendars()[0].id, [Validators.required]),
    title: new FormControl('', [Validators.required, Validators.minLength(1)]),
    description: new FormControl(''),
    location: new FormControl(''),
    date: new FormControl(''),
    scheduled_at: new FormControl(''),
  });

  async onCreate() {
    if (this.newTaskForm.invalid) return;
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const formData = this.newTaskForm.value;
      const newTask: CreateTask = {
        calendar_id: formData.calendar_id as string,
        title: formData.title as string,
        description: formData.description ? formData.description : null,
        location: formData.location ? formData.location : null,
        date: formData.date ? formData.date : null,
        scheduled_at: formData.scheduled_at ? formData.scheduled_at : null,
      };

      await this.calendarService.createTask(newTask);

      this.newTaskForm.reset();
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.errorMessage.set(
          err.message ?? 'An error occured while trying to create task. Please try again.'
        );
      }
    } finally {
      this.loading.set(false);
    }
  }
}
