import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { SupabaseService } from '../../../services/supabase';
import { LoaderComponent } from '../../../components/loader/loader';

@Component({
  selector: 'app-log-in',
  imports: [FormsModule, CommonModule, MatButtonModule, ReactiveFormsModule, LoaderComponent],
  templateUrl: './logIn.html',
  styleUrl: './logIn.scss',
})
export class LogInComponent {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal('');

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  async onLogIn() {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const { email, password } = this.loginForm.value;

      const { error } = await this.supabase.supabaseClient.auth.signInWithPassword({
        email: email!,
        password: password!,
      });

      if (error) throw error;

      this.router.navigate(['/']);
    } catch (error: unknown) {
      this.errorMessage.set(this.getErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      if (error.message.includes('Invalid login credentials')) {
        return 'Invalid email or password. Please try again.';
      }
      if (error.message.includes('Email not confirmed')) {
        return 'Please verify your email before logging in.';
      }
      return error.message;
    }
    return 'An error occurred during login. Please try again.';
  }
}
