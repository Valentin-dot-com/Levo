import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase';
import { Board, CreateBoard, CreateSubBoard } from '../models/board.model';
import { UUID } from '../models/primitives.model';
import { CalendarService } from './calendars';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private supabase = inject(SupabaseService);
  private calendarService = inject(CalendarService);

  private _boards = signal<Board[]>([]);
  private _currentSubBoards = signal<Board[]>([]);

  readonly boards = this._boards.asReadonly();
  readonly currentSubBoards = this._currentSubBoards.asReadonly();

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

  async getSubBoards(parentBoardId: string): Promise<void> {

    if (!parentBoardId) {
      throw new Error('No parent-board ID was found. Could not fetch sub-boards')
    }

    const { data, error } = await this.supabase.supabaseClient
      .from('boards')
      .select('*')
      .eq('parent_board_id', parentBoardId)
      .order('order_index');

    if (error) throw error;
    this._currentSubBoards.set(data ?? []);
  }

  // Filter purposes
  getBoardsByCalendar(calendarId: UUID): Board[] {
    return this._boards().filter((board) => board.calendar_id === calendarId);
  }

  async createBoard(board: CreateBoard): Promise<Board | null> {
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

  async createSubBoard(board: CreateSubBoard): Promise<Board |null> {
    const { data, error } = await this.supabase.supabaseClient
      .from('boards')
      .insert({
        calendar_id: board.calendar_id,
        title: board.title,
        parent_board_id: board.parent_board_id,
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

  async deleteBoard(id: UUID): Promise<boolean> {
    const { error } = await this.supabase.supabaseClient.from('boards').delete().eq('id', id);

    if (error) throw error;

    this._boards.update((boards) => boards.filter((board) => board.id !== id));
    this._currentSubBoards.update((boards) => boards.filter((board) => board.id !== id));
    return true;
  }
}
