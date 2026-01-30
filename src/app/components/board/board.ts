import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BoardService } from '../../services/boards';
import { EditorComponent } from './editor/editor';
import { DeleteIconComponent } from '../../icons/deleteIcon';
import { ArrowLeftIconComponent } from '../../icons/arrowLeftIcon';
import { LoaderComponent } from '../loader/loader';
import { FeedbackMessageService } from '../../services/feedbackMessage';
import { NewSubBoardComponent } from '../forms/new-sub-board/new-sub-board';
import { DeleteBoardComponent } from '../delete-board/delete-board';
import { UUID } from '../../models/primitives.model';
import { CloseBtnComponent } from '../close-btn/close-btn';

@Component({
  selector: 'app-board',
  imports: [
    CommonModule,
    RouterLink,
    EditorComponent,
    DeleteIconComponent,
    ArrowLeftIconComponent,
    LoaderComponent,
    NewSubBoardComponent,
    DeleteBoardComponent,
    CloseBtnComponent,
  ],
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
      console.error('Failed to load board. ', err);
      this.feedbackService.setError(err instanceof Error ? err.message : 'Failed to load board');
    } finally {
      this.loading.set(false);
    }
  }

  goBack(parentId: UUID | null) {
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

  deleteBoard(parentBoardId: UUID | null) {
    this.openDelete.set(false);
    this.goBack(parentBoardId);
  }

  ngOnDestroy(): void {
    this.boardService.clearCurrent();
  }
}
