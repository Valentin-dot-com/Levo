import { effect, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase';
import { UUID } from '../models/primitives.model';
import { Profile } from '../models/profile.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  private _currentUser$ = new BehaviorSubject<User | null>(null);
  private _session$ = new BehaviorSubject<Session | null>(null);
  private _profile$ = signal<Profile | null>(null);
  private _userSignal = signal<User | null>(null);

  private _isLoading$ = new BehaviorSubject<boolean>(true);

  user$ = this._currentUser$.asObservable();
  session$ = this._session$.asObservable();
  isLoading$ = this._isLoading$.asObservable();
  profile = this._profile$.asReadonly();
  userSignal = this._userSignal.asReadonly();

  constructor() {
    this.initAuthListener();

    effect(() => {
      const user = this._userSignal();

      if (!user) {
        this._profile$.set(null);
        return;
      }

      this.getProfile(user.id);
    });
  }

  private async initAuthListener() {
    const { data } = await this.supabase.supabaseClient.auth.getSession();

    this.setUser(data.session?.user ?? null, data.session);
    this._isLoading$.next(false);

    this.supabase.supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        this.resetAuthState();
        return;
      }

      this.setUser(session?.user ?? null, session);
    });
  }

  private setUser(user: User | null, session: Session | null) {
    this._currentUser$.next(user);
    this._session$.next(session);
    this._userSignal.set(user);
  }

  get currentUser(): User | null {
    return this._currentUser$.getValue();
  }

  get isAuthenticated(): boolean {
    return this._currentUser$.getValue() !== null;
  }

  async getProfile(userId: UUID) {
    const { data, error } = await this.supabase.supabaseClient
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    if (this._userSignal()?.id === userId) {
      this._profile$.set(data ?? null);
    }
  }

  getUserId(): UUID {
    const userId = this.currentUser?.id;
    if (!userId) {
      throw new Error('Cannot retrieve user ID: User is not authenticated');
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

  async signUp(email: string, password: string, firstName: string, lastName: string) {
    return this.supabase.supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });
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

  private resetAuthState() {
    this.setUser(null, null);
    this._profile$.set(null);
  }

  // Might include at a later time
  // downLoadImage(path: string) {
  //   return this.supabase.storage.from('avatars').download(path);
  // }

  // uploadAvatar(filePath: string, file: File) {
  //   return this.supabase.storage.from('avatars').upload(filePath, file);
  // }
}
