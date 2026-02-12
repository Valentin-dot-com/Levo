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
import { RealtimeChannel } from '@supabase/supabase-js';
import { UserPresence } from '../../models/board.model';
import { AuthService } from '../../services/authenticate';
import { SupabaseService } from '../../services/supabase';
import { ProfileIconComponent } from '../../icons/profileIcon';

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
    ProfileIconComponent,
  ],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class BoardComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private boardService = inject(BoardService);
  private auth = inject(AuthService);
  private supabase = inject(SupabaseService);
  private feedbackService = inject(FeedbackMessageService);

  loading = signal(false);
  boardId = signal('');
  currentBoard = this.boardService.currentBoard;
  openCreate = signal(false);
  openDelete = signal(false);

  private presenceChannel: RealtimeChannel | null = null;
  activeUsers = signal<UserPresence[]>([]);

  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
      this.boardId.set(params['boardId']);
      await this.loadBoard();
      this.setupPresence();
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

  private cleanupPresence() {
    if (this.presenceChannel) {
      const channel = this.presenceChannel;
      this.presenceChannel = null;
      channel.untrack().catch((err) => {
        if (err instanceof Error) {
          console.warn('Failed to untrack presence channel');
        }
      }).finally(() => {
        this.supabase.supabaseClient.removeChannel(channel);
      });
    }
    this.activeUsers.set([]);
  }

  setupPresence() {
    this.cleanupPresence();

    const boardId = this.boardId();
    const currentUserId = this.auth.currentUser?.id;
    const currentUserName = this.auth.profile()?.first_name ?? 'Unknown';

    if (!boardId || !currentUserId) return;

    const channel = this.supabase.supabaseClient
      .channel(`board-presence:${boardId}`, {
        config: {
          presence: {
            key: currentUserId,
          },
        },
      })
      .on('presence', { event: 'sync' }, () => {
        if (this.presenceChannel !== channel) return;

        const state = channel.presenceState<UserPresence>();
        const users: UserPresence[] = [];

        Object.entries(state).forEach(([userId, presences]) => {
          const presence = presences[0];
          if (presence && userId !== currentUserId) {
            users.push(presence);
          }
        });

        this.activeUsers.set(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && this.presenceChannel === channel) {
          await channel.track({
            userId: currentUserId,
            userName: currentUserName,
            joinedAt: Date.now(),
          });
        }
      });

    this.presenceChannel = channel;
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
    this.cleanupPresence();
  }
}
