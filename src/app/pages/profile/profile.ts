import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/authenticate';
import { SupabaseService } from '../../services/supabase';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent {
  private auth = inject(AuthService);
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  isDeleting = signal(false);
  errorMessage = signal('');

  currentUser = this.auth.profile;

  signOut() {
    this.auth.signOut();
  }

  async deleteAccount() {
    const confirmation = confirm('This will permanently delete your account and all your data, this action cannot be undone! Are you sure?');

    if (!confirmation) return;

    this.isDeleting.set(true);
    this.errorMessage.set('');

    try {
      await this.supabase.deleteAccount();

      this.router.navigate(['/']);
    } catch (err: unknown) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Failed to delete account. Please try again');
    } finally {
      this.isDeleting.set(false);
    }
  }
}
