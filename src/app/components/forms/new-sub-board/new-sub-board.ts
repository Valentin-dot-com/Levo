import { CommonModule } from '@angular/common';
import { Component, inject, input, output, signal } from '@angular/core';
import { BoardService } from '../../../services/boards';
import { FeedbackMessageService } from '../../../services/feedbackMessage';

@Component({
  selector: 'app-new-sub-board',
  imports: [CommonModule],
  templateUrl: './new-sub-board.html',
  styleUrl: './new-sub-board.scss',
})
export class NewSubBoardComponent {
  private boardService = inject(BoardService);
  private feedbackService = inject(FeedbackMessageService);

  currentBoard = this.boardService.currentBoard;
  newSubBoardTitle = signal('');

  boardId = input('');

  closeCreateNew = output();

  async createSubBoard() {
    const calendarId = this.currentBoard()?.board?.calendar_id;
    if (!this.newSubBoardTitle().trim() || !this.currentBoard || !calendarId) {
      this.feedbackService.setError('Something went wrong, please try again.');
      return;
    }

    try {
      await this.boardService.createSubBoard({
        calendar_id: calendarId,
        title: this.newSubBoardTitle(),
        parent_board_id: this.boardId(),
        order_index: this.currentBoard()?.subBoards.length || 0,
      });

      this.newSubBoardTitle.set('');
      this.feedbackService.setSuccess('Sub-board created successfully');
      setTimeout(() => this.feedbackService.setSuccess(''), 3000);
      this.close();
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.feedbackService.setError(err.message ?? 'An error occured, could not create sub-board.');
      } else {
        this.feedbackService.setError('An error occured, could not create sub-board.');
      }
      setTimeout(() => {
        this.feedbackService.setError('')
      }, 5000);
    }
  }

  close() {
    this.closeCreateNew.emit();
  }
}
