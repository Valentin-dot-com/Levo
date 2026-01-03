import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase';
import { Board } from '../models/board';
import { UUID } from '../models/primitives';
import { CalendarService } from './calendars';
import { AuthService } from './authenticate';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private supabase = inject(SupabaseService);
  private calendar = inject(CalendarService);
  private auth = inject(AuthService);

  private _boards = signal<Board[]>([]);
  private _error = signal<string | null>(null);

  readonly boards = this._boards.asReadonly();
  readonly error = this._error.asReadonly();

  async fetchUserBoards(): Promise<void> {
    this._error.set(null);

    try {
      const calendarIds = this.calendar.calendarIds();

      if (calendarIds.length === 0) {
        this._boards.set([]);
        return;
      }

      const { data, error } = await this.supabase.supabaseClient
        .from('boards')
        .select('*')
        .in('calendar_id', calendarIds);

      if (error) throw error;
      this._boards.set(data ?? []);
    } catch (err) {
      this._error.set(err instanceof Error ? err.message : 'Failed to fetch boards');
    }
  }

  // Filter purposes
  getBoardsByCalendar(calendarId: UUID): Board[] {
    return this._boards().filter((board) => board.calendar_id === calendarId);
  }

  async createBoard(calendarId: UUID, title: string): Promise<Board | null> {
    this._error.set(null);

    try {
      const userId = this.auth.getUserId();

      if (!userId) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await this.supabase.supabaseClient
        .from('boards')
        .insert({
          calendar_id: calendarId,
          owner_id: userId,
          title,
        })
        .select()
        .single();

      if (error) throw error;

      this._boards.update((boards) => [...boards, data]);
      return data;
    } catch (err) {
      this._error.set(err instanceof Error ? err.message : 'Failed to create board');
      return null;
    }
  }

  async updateBoard(id: UUID, title: string): Promise<Board | null> {
    this._error.set(null);

    try {
      const { data, error } = await this.supabase.supabaseClient
        .from('boards')
        .update({ title })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      this._boards.update((boards) => boards.map((board) => (board.id === id ? data : board)));
      return data;
    } catch (err) {
      this._error.set(err instanceof Error ? err.message : 'Failed to update board');
      return null;
    }
  }

  async deleteBoard(id: UUID): Promise<boolean> {
    this._error.set(null);

    try {
      const { error } = await this.supabase.supabaseClient.from('boards').delete().eq('id', id);

      if (error) throw error;

      this._boards.update((boards) => boards.filter((board) => board.id !== id));
      return true;
    } catch (err) {
      this._error.set(err instanceof Error ? err.message : 'Failed to delete board');
      return false;
    }
  }
}
