import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BoardService } from '../../services/boards';
import { EditorComponent } from './editor/editor';
import { DeleteIconComponent } from '../../icons/deleteIcon';
import { ArrowLeftIconComponent } from '../../icons/arrowLeftIcon';
import { LoaderComponent } from '../loader/loader';
import { FeedbackMessageService } from '../../services/feedbackMessage';
import { AddIconComponent } from '../../icons/addIcon';
import { NewSubBoardComponent } from '../forms/new-sub-board/new-sub-board';

@Component({
  selector: 'app-board',
  imports: [CommonModule, RouterLink, EditorComponent, DeleteIconComponent, ArrowLeftIconComponent, LoaderComponent, NewSubBoardComponent, AddIconComponent],
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

  deleteBoard(boardId: string) {
    this.boardService.deleteBoard(boardId);
    this.openDelete.set(false);
    this.goBack();
  }

  ngOnDestroy(): void {
    this.boardService.clearCurrent();
  }
}
