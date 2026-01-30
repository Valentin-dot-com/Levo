import { Component, inject, signal  } from '@angular/core';
import { CalendarService } from '../../../services/calendars';
import { BoardService } from '../../../services/boards';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ɵInternalFormsSharedModule, ReactiveFormsModule } from '@angular/forms';
import { CreateBoard } from '../../../models/board.model';
import { CustomSelectorComponent } from '../../custom-select/custom-select';
import { FeedbackMessageService } from '../../../services/feedbackMessage';

@Component({
  selector: 'app-new-board',
  imports: [CommonModule, ɵInternalFormsSharedModule, ReactiveFormsModule, CustomSelectorComponent],
  templateUrl: './new-board.html',
  styleUrl: './new-board.scss',
})
export class NewBoardComponent {
  private calendarService = inject(CalendarService);
  private boardService = inject(BoardService);
  private feedbackService = inject(FeedbackMessageService);

  loading = signal(false);
  calendars = this.calendarService.calendars;

  newBoardForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(1)]),
    calendar_id: new FormControl(this.calendars()[0].id, [Validators.required]),
  });

  async onCreate() {
    if (this.newBoardForm.invalid) return;
    this.loading.set(true);
    this.feedbackService.setError('');
    this.feedbackService.setSuccess('');

    try {
      const formData = this.newBoardForm.value;
      const newBoard: CreateBoard = {
        title: formData.title as string,
        calendar_id: formData.calendar_id as string,
      };

      await this.boardService.createBoard(newBoard);

      this.newBoardForm.reset();
      this.feedbackService.setSuccess('Board created successfully!');
      setTimeout(() => this.feedbackService.setSuccess(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.feedbackService.setError(
          err.message ?? 'An error occured while trying to create board. Please try again.'
        );
      }
    } finally {
      this.loading.set(false);
    }
  }
}
