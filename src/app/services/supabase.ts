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
}
