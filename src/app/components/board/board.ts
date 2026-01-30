import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BoardService } from '../../services/boards';
import { EditorComponent } from './editor/editor';
import { DeleteIconComponent } from '../../icons/deleteIcon';
import { ArrowLeftIconComponent } from '../../icons/arrowLeftIcon';
import { LoaderComponent } from '../loader/loader';
import { FeedbackMessageService } from '../../services/feedbackMessage';

@Component({
  selector: 'app-board',
  imports: [CommonModule, RouterLink, EditorComponent, DeleteIconComponent, ArrowLeftIconComponent, LoaderComponent],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class BoardComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private boardService = inject(BoardService);
  private feedbackService = inject(FeedbackMessageService);

  loading = signal(false);
  boardId = signal('');
  currentBoard = this.boardService.currentBoard;
  newSubBoardTitle = signal('');
  openCreate = signal(false);
  openDelete = signal(false);

  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
      this.boardId.set(params['boardId']);
      await this.loadBoard();
    });
  }

  async loadBoard() {
    this.loading.set(true);
    try {
      await this.boardService.getBoardWithDetails(this.boardId());
    } catch (err: unknown) {
      console.error('Failed to load board. ', err)
      this.feedbackService.setError(err instanceof Error ? err.message : 'Failed to load board');
    } finally {
      this.loading.set(false);
    }
  }

  goBack() {
    const parentId = this.currentBoard()?.board?.parent_board_id;
    if (parentId) {
      this.router.navigate(['/boards', parentId]);
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

  openCreateSub() {
    this.openCreate.set(true);
  }

  close() {
    this.openCreate.set(false);
    this.openDelete.set(false);
  }

  openDeleteDialog() {
    this.openDelete.set(true);
  }

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
      this.openCreate.set(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.feedbackService.setError(err.message ?? 'An error occured, could not create sub-board.');
      } else {
        this.feedbackService.setError('An error occured, could not create sub-board.');
      }
    }
  }

  deleteBoard(boardId: string) {
    this.boardService.deleteBoard(boardId);
    this.openDelete.set(false);
    this.goBack();
  }

  ngOnDestroy(): void {
    this.boardService.clearCurrent();
  }
}
