import { Injectable } from '@angular/core';
import {
  createClient,
  SupabaseClient,
} from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  readonly supabaseClient: SupabaseClient;

  constructor() {
    this.supabaseClient = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async deleteAccount(): Promise<void> {
    const { data: { session }, error: sessionError } = await this.supabaseClient.auth.getSession();

    if (sessionError || !session) {
      throw new Error('No active session');
    }

    const { error } = await this.supabaseClient.functions.invoke('delete-account', {
      body: { confirm: true },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    if (error) {
      throw error;
    }

    await this.supabaseClient.auth.signOut();
  }
}
