import { AfterViewInit, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BoardService } from '../../services/boards';
import { EditorComponent } from './editor/editor';

@Component({
  selector: 'app-board',
  imports: [CommonModule, RouterLink, EditorComponent],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class BoardComponent implements AfterViewInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private boardService = inject(BoardService)

  loading = signal(false);
  boardId = signal('');
  currentBoard = this.boardService.currentBoard;
  newSubBoardTitle = signal('');


  ngAfterViewInit(): void {
    this.boardId.set(this.route.snapshot.params['boardId']);
    this.loadBoard();
  }

  loadBoard() {
    this.loading.set(true);
    this.boardService.getBoardWithDetails(this.boardId());
    this.loading.set(false);
  }

  goBack() {
    if (this.currentBoard()?.board?.parent_board_id) {
      this.router.navigate(['../', this.currentBoard()?.board?.parent_board_id]);
    } else {
      this.router.navigate(['../'], { relativeTo: this.route});
    }
  }

  createSubBoard() {
    const calendarId = this.currentBoard()?.board?.calendar_id;
    if (!this.newSubBoardTitle().trim() || !this.currentBoard || !calendarId) return;

    this.boardService.createSubBoard({
      calendar_id: calendarId,
      title: this.newSubBoardTitle(),
      parent_board_id: this.boardId(),
      order_index: this.currentBoard()?.subBoards.length || 0
    });
  }
}
