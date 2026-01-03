import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase';
import { UUID } from '../models/primitives';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  private _currentUser$ = new BehaviorSubject<User | null>(null);
  private _session$ = new BehaviorSubject<Session | null>(null);
  private _isLoading$ = new BehaviorSubject<boolean>(true);

  user$ = this._currentUser$.asObservable();
  session$ = this._session$.asObservable();
  isLoading$ = this._isLoading$.asObservable();

  constructor() {
    this.initAuthListener();
  }

  private async initAuthListener() {
    const { data } = await this.supabase.supabaseClient.auth.getSession();

    await new Promise((resolve) => setTimeout(resolve, 2000));

    this._session$.next(data.session);
    this._currentUser$.next(data.session?.user ?? null);

    this._isLoading$.next(false);

    this.supabase.supabaseClient.auth.onAuthStateChange((_event, session) => {
      this._session$.next(session);
      this._currentUser$.next(session?.user ?? null);
    });
  }

  // Sync getters - use for quick checks when its redundant to subscribe to a observable
  get currentUser(): User | null {
    return this._currentUser$.getValue();
  }

  get isAuthenticated(): boolean {
    return this._currentUser$.getValue() !== null;
  }

  getUserId(): UUID {
    const userId = this.currentUser?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return userId;
  }

  async getSession() {
    const { data } = await this.supabase.supabaseClient.auth.getSession();
    return data.session;
  }

  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.supabaseClient.auth.onAuthStateChange(callback);
  }

  signIn(email: string, password: string) {
    return this.supabase.supabaseClient.auth.signInWithPassword({ email, password });
  }

  signUp(email: string, password: string) {
    return this.supabase.supabaseClient.auth.signUp({ email, password });
  }

  async signOut() {
    const { error } = await this.supabase.supabaseClient.auth.signOut();
    if (!error) {
      this.router.navigate(['/auth']);
    }
    return { error };
  }

  async signInWithGoogle() {
    return this.supabase.supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  // Might include at a later time
  // downLoadImage(path: string) {
  //   return this.supabase.storage.from('avatars').download(path);
  // }

  // uploadAvatar(filePath: string, file: File) {
  //   return this.supabase.storage.from('avatars').upload(filePath, file);
  // }
}
