import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/authenticate';
import { LogInComponent } from './logIn/logIn';
import { SignUpComponent } from './signUp/signUp';

@Component({
  selector: 'app-auth',
  imports: [FormsModule, CommonModule, LogInComponent, SignUpComponent],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class AuthComponent {
  private auth = inject(AuthService);
  isLoginView = true;

  toggleMode() {
    this.isLoginView = !this.isLoginView;
  }

  signInWithGoogle() {
    this.auth.signInWithGoogle();
  }
}
