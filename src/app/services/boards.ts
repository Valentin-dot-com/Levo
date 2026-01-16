import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase';
import { Board, BoardWithDetails, CreateBoard, CreateSubBoard } from '../models/board.model';
import { UUID } from '../models/primitives.model';
import { CalendarService } from './calendars';
import { JSONContent } from '@tiptap/core';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private supabase = inject(SupabaseService);
  private calendarService = inject(CalendarService);

  private _boards = signal<Board[]>([]);
  private _currentSubBoards = signal<Board[]>([]);
  private _currentBoard = signal<BoardWithDetails | null>(null);

  readonly boards = this._boards.asReadonly();
  readonly currentSubBoards = this._currentSubBoards.asReadonly();
  readonly currentBoard = this._currentBoard.asReadonly();

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

  // This one might be redundant if I have the getBoardWithDetails-method...
  async getSubBoards(parentBoardId: string): Promise<void> {
    if (!parentBoardId) {
      throw new Error('No parent-board ID was found. Could not fetch sub-boards');
    }

    const { data, error } = await this.supabase.supabaseClient
      .from('boards')
      .select('*')
      .eq('parent_board_id', parentBoardId)
      .order('order_index');

    if (error) throw error;
    this._currentSubBoards.set(data ?? []);
  }

  async getBoardWithDetails(boardId: string): Promise<void> {
    if (!boardId) {
      throw new Error('No board-ID was given, could not fetch data.');
    }

    const [
      { data: board, error: boardError },
      { data: item, error: itemsError },
      { data: subBoards, error: subBoardsError },
    ] = await Promise.all([
      this.supabase.supabaseClient.from('boards').select('*').eq('id', boardId).single(),
      this.supabase.supabaseClient.from('board_items').select('*').eq('board_id', boardId).single(),
      this.supabase.supabaseClient
        .from('boards')
        .select('*')
        .eq('parent_board_id', boardId)
        .order('order_index'),
    ]);

    if (boardError) throw boardError;
    if (itemsError) throw itemsError;
    if (subBoardsError) throw subBoardsError;

    const boardWithDetails: BoardWithDetails = {
      board: board ?? null,
      subBoards: subBoards ?? [],
      boardItem: item ?? null,
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

    this._currentSubBoards.update((boards) => [...boards, data]);
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
      .update({ content, updated_at: new Date()})
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
    this._currentSubBoards.update((boards) => boards.filter((board) => board.id !== id));
    return true;
  }
}
