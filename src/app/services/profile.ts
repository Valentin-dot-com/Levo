import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase';
import { User } from '@supabase/supabase-js';
import { Profile } from '../models/profile';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private supabase = inject(SupabaseService);

  getProfile(user: User) {
    return this.supabase.supabaseClient
      .from('profiles')
      .select(`user_id, first_name, last_name, created_at`)
      .eq('user_id', user.id)
      .single();
  }

  updateProfile(profile: Profile) {
    return this.supabase.supabaseClient.from('profiles').upsert(profile);
  }
}
