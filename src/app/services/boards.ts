import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase';
import { Board } from '../models/board.model';
import { UUID } from '../models/primitives.model';
import { CalendarService } from './calendars';
import { AuthService } from './authenticate';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private supabase = inject(SupabaseService);
  private calendarService = inject(CalendarService);
  private auth = inject(AuthService);

  private _boards = signal<Board[]>([]);

  readonly boards = this._boards.asReadonly();

  async fetchUserBoards(): Promise<void> {
    const calendarIds = this.calendarService.calendarIds();

    if (calendarIds.length === 0) {
      throw new Error('No calendar memberships for current user. Could not fetch boards');
    }

    const { data, error } = await this.supabase.supabaseClient
      .from('boards')
      .select('*')
      .in('calendar_id', calendarIds);

    if (error) throw error;
    this._boards.set(data ?? []);
  }

  // Filter purposes
  getBoardsByCalendar(calendarId: UUID): Board[] {
    return this._boards().filter((board) => board.calendar_id === calendarId);
  }

  async createBoard(calendarId: UUID, title: string): Promise<Board | null> {
    const userId = this.auth.getUserId();

    if (!userId) {
      throw new Error(
        'No user ID for current user. User not authenticated, could not create board'
      );
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
    return true;
  }
}
