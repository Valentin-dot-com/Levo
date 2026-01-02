import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/authenticate';
import { MatButtonModule } from '@angular/material/button'

@Component({
  selector: 'app-auth',
  imports: [FormsModule, CommonModule, MatButtonModule],
  templateUrl: './auth.html',
  styleUrls: ['./auth.scss'],
})
export class AuthComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  isLoginView = true;
  loading = false;
  errorMessage = '';

  toggleMode() {
    this.isLoginView = !this.isLoginView;
    this.errorMessage = '';
  }

  signInWithGoogle() {
    this.auth.signInWithGoogle();
  }

  signOut() {
    this.auth.signOut();
  }

  async onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      if (this.isLoginView) {
        const { error } = await this.auth.signIn(this.email, this.password);
        if (error) throw error;
      } else {
        const { error } = await this.auth.signUp(this.email, this.password);
        if (error) throw error;
        return;
      }

      // Redirect on success
      this.router.navigate(['/']);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.errorMessage = error.message || 'An error occurred';
      }
    } finally {
      this.loading = false;
    }
  }
}
