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
  selector: 'app-sign-up',
  imports: [FormsModule, CommonModule, MatButtonModule, ReactiveFormsModule, LoaderComponent],
  templateUrl: './signUp.html',
  styleUrl: './signUp.scss',
})
export class SignUpComponent {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  signUpForm = new FormGroup({
    firstName: new FormControl('', [Validators.required, Validators.minLength(2)]),
    lastName: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });

  async onSignUp() {
    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const { firstName, lastName, email, password } = this.signUpForm.value;

      const { error } = await this.supabase.supabaseClient.auth.signUp({
        email: email!,
        password: password!,
        options: {
          data: {
            first_name: firstName!,
            last_name: lastName!,
          },
        },
      });

      if (error) throw error;

      this.successMessage.set(
        'Account created successfully! Please check your email to verify your account.'
      );
      this.signUpForm.reset();
      setTimeout(() => this.router.navigate(['/login']), 10000);
    } catch (error: unknown) {
      this.errorMessage.set(this.getErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      if (error.message.includes('already registered')) {
        return 'This email is already registered. Try logging in instead.';
      }
      if (error.message.includes('Invalid email')) {
        return 'Please enter a valid email address.';
      }
      if (error.message.includes('Password')) {
        return 'Password must be at least 8 characters long.';
      }
      return error.message;
    }
    return 'An error occurred during sign up. Please try again.';
  }
}
