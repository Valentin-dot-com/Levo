import { effect, inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase';
import { Board, BoardWithDetails, CreateBoard, CreateSubBoard } from '../models/board.model';
import { UUID } from '../models/primitives.model';
import { CalendarService } from './calendars';
import { JSONContent } from '@tiptap/core';
import { AuthService } from './authenticate';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private supabase = inject(SupabaseService);
  private auth = inject(AuthService);
  private calendarService = inject(CalendarService);

  private _boards = signal<Board[]>([]);
  private _currentBoard = signal<BoardWithDetails | null>(null);
  private _parentBoard = signal<Board | null>(null);

  readonly boards = this._boards.asReadonly();
  readonly currentBoard = this._currentBoard.asReadonly();
  readonly parentBoard = this._parentBoard.asReadonly();

  constructor() {
    effect(() => {
      if (!this.auth.userSignal()) {
        this.reset()
      }
    })
  }

  async getRootBoards(): Promise<void> {
    const calendarIds = this.calendarService.calendarIds();

    if (calendarIds.length === 0) {
      throw new Error('No calendar memberships for current user. Could not fetch boards');
    }

    const { data, error } = await this.supabase.supabaseClient
      .from('boards')
      .select('*')
      .in('calendar_id', calendarIds)
      .is('parent_board_id', null)
      .order('order_index');

    if (error) throw error;
    this._boards.set(data ?? []);
  }

  private async fetchBoardById(id: string) {
    const { data, error } = await this.supabase.supabaseClient
      .from('boards')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data ?? null;
  }

  private async fetchBoardItemByBoardId(boardId: string) {
    const { data, error } = await this.supabase.supabaseClient
      .from('board_items')
      .select('*')
      .eq('board_id', boardId)
      .single();
    if (error) throw error;
    return data ?? null;
  }

  private async fetchSubBoards(parentBoardId: string) {
    const { data, error } = await this.supabase.supabaseClient
      .from('boards')
      .select('*')
      .eq('parent_board_id', parentBoardId)
      .order('order_index');
    if (error) throw error;
    return data ?? [];
  }

  async getBoardWithDetails(boardId: string): Promise<void> {
    if (!boardId) throw new Error('No board-ID was given, could not fetch data.');

    const [board, boardItem, subBoards] = await Promise.all([
      this.fetchBoardById(boardId),
      this.fetchBoardItemByBoardId(boardId),
      this.fetchSubBoards(boardId),
    ]);

    let parentBoard = null;
    const parentId = board?.parent_board_id ?? null;
    if (parentId) {
      parentBoard = await this.fetchBoardById(parentId);
    }

    const boardWithDetails: BoardWithDetails = {
      board,
      subBoards,
      boardItem,
      parentBoard,
    };

    this._currentBoard.set(boardWithDetails);
  }

  // Filter purposes
  getBoardsByCalendar(calendarId: UUID): Board[] {
    return this._boards().filter((board) => board.calendar_id === calendarId);
  }

  async createBoard(board: CreateBoard): Promise<Board | null> {
    if (!board) throw new Error('No board-data was sent. No board was created');

    const { data, error } = await this.supabase.supabaseClient
      .from('boards')
      .insert({
        calendar_id: board.calendar_id,
        title: board.title,
      })
      .select()
      .single();

    if (error) throw error;

    this._boards.update((boards) => [...boards, data]);
    return data;
  }

  async createSubBoard(board: CreateSubBoard): Promise<Board | null> {
    const { data, error } = await this.supabase.supabaseClient
      .from('boards')
      .insert({
        calendar_id: board.calendar_id,
        title: board.title,
        parent_board_id: board.parent_board_id,
        order_index: board.order_index,
      })
      .select()
      .single();

    if (error) throw error;

    this._currentBoard.update((boardWithDetails) => {
      if (!boardWithDetails) return boardWithDetails;
      return {
        ...boardWithDetails,
        subBoards: [...(boardWithDetails.subBoards ?? []), data],
      };
    });
    return data;
  }

  async updateBoard(id: UUID, title: string): Promise<Board | null> {
    const { data, error } = await this.supabase.supabaseClient
      .from('boards')
      .update({ title })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    this._boards.update((boards) => boards.map((board) => (board.id === id ? data : board)));
    return data;
  }

  async updateBoardItem(boardId: string, content: JSONContent): Promise<void> {
    const { data, error } = await this.supabase.supabaseClient
      .from('board_items')
      .update({ content, updated_at: new Date() })
      .eq('board_id', boardId)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async deleteBoard(id: UUID): Promise<boolean> {
    const { error } = await this.supabase.supabaseClient.from('boards').delete().eq('id', id);

    if (error) throw error;

    this._boards.update((boards) => boards.filter((board) => board.id !== id));
    this._currentBoard.update((current) => {
      if (!current) return current;
      if (current.board && current.board.id === id) {
        return null;
      }
      return {
        ...current,
        subBoards: current.subBoards.filter((board) => board.id !== id),
      };
    });
    return true;
  }

  clearCurrent() {
    this._currentBoard.set(null);
  }

  reset() {
    this._boards.set([]);
    this._currentBoard.set(null);
    this._parentBoard.set(null);
  }
}
