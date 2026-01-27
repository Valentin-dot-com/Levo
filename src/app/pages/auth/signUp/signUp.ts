import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LoaderComponent } from '../../../components/loader/loader';
import { AuthService } from '../../../services/authenticate';
import { ShowIconComponent } from '../../../icons/showIcon';
import { HideIconComponent } from '../../../icons/hideIcon';

@Component({
  selector: 'app-sign-up',
  imports: [FormsModule, CommonModule, ReactiveFormsModule, LoaderComponent, ShowIconComponent, HideIconComponent],
  templateUrl: './signUp.html',
  styleUrl: './signUp.scss',
})
export class SignUpComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showPassword = signal(false);

  signUpForm = new FormGroup(
    {
      firstName: new FormControl('', [Validators.required, Validators.minLength(2)]),
      lastName: new FormControl('', [Validators.required, Validators.minLength(2)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator()]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: this.passwordMatchValidator },
  );

  passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumeric = /[0-9]/.test(value);
      const hasSymbol = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value);

      const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSymbol;

      return !passwordValid
        ? {
            passwordStrength: {
              hasUpperCase,
              hasLowerCase,
              hasNumeric,
              hasSymbol,
            },
          }
        : null;
    };
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) return null;

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  async onSignUp() {
    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const { firstName, lastName, email, password } = this.signUpForm.value;

      const { error } = await this.auth.signUp(email!, password!, firstName!, lastName!);

      if (error) throw error;

      this.successMessage.set(
        'Account created successfully! Please check your email to verify your account.',
      );
      this.signUpForm.reset();
      setTimeout(() => this.router.navigate(['/login']), 3000);
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
        return 'Password must be at least 8 characters long and contain at least one uppercase and lowercase letter, one number and one symbol.';
      }
      return error.message;
    }
    return 'An error occurred during sign up. Please try again.';
  }

  togglePasswordVisibility() {
    this.showPassword.update(value => !value)
  }
}
