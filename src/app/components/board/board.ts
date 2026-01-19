import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BoardService } from '../../services/boards';
import { EditorComponent } from './editor/editor';
import { DeleteIconComponent } from '../../icons/deleteIcon';
import { ArrowLeftIconComponent } from '../../icons/arrowLeftIcon';

@Component({
  selector: 'app-board',
  imports: [
    CommonModule,
    RouterLink,
    EditorComponent,
    DeleteIconComponent,
    ArrowLeftIconComponent,
  ],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class BoardComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private boardService = inject(BoardService);

  loading = signal(false);
  boardId = signal('');
  currentBoard = this.boardService.currentBoard;
  newSubBoardTitle = signal('');
  successMessage = signal('');
  errorMessage = signal('');
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
    await this.boardService.getBoardWithDetails(this.boardId());
    this.loading.set(false);
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
    if (!this.newSubBoardTitle().trim() || !this.currentBoard || !calendarId) return;

    try {
      await this.boardService.createSubBoard({
        calendar_id: calendarId,
        title: this.newSubBoardTitle(),
        parent_board_id: this.boardId(),
        order_index: this.currentBoard()?.subBoards.length || 0,
      });

      this.newSubBoardTitle.set('');
      this.successMessage.set('Sub-board created successfully');
      setTimeout(() => this.successMessage.set(''), 3000);
      this.openCreate.set(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.errorMessage.set(err.message ?? 'An error occured, could not create sub-board.');
      } else {
        this.errorMessage.set('An error occured, could not create sub-board.');
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
