import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { BoardService } from '../../services/boards';
import { FeedbackMessageService } from '../../services/feedbackMessage';
import { DeleteIconComponent } from '../../icons/deleteIcon';
import { BoardWithDetails } from '../../models/board.model';
import { UUID } from '../../models/primitives.model';

@Component({
  selector: 'app-delete-board',
  imports: [CommonModule, DeleteIconComponent],
  templateUrl: './delete-board.html',
  styleUrl: './delete-board.scss',
})
export class DeleteBoardComponent {
  private boardService = inject(BoardService);
  private feedbackService = inject(FeedbackMessageService);

  board = input<BoardWithDetails | null>(null);

  deleted = output<UUID |null>();

  async confirmDelete() {
    const boardId = this.board()?.board?.id;
    const parentBoardId = this.board()?.board?.parent_board_id ?? null;

    if (!boardId) {
      this.feedbackService.setError('Could not delete board, please try again later');
      return;
    }

    try {
      await this.boardService.deleteBoard(boardId);
      this.deleted.emit(parentBoardId);
      this.feedbackService.setSuccess('Board deleted successfully');
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.feedbackService.setError(
          err.message ?? 'An error occured, could not create sub-board.',
        );
      } else {
        this.feedbackService.setError('An error occured, could not create sub-board.');
      }
    }
  }
}
