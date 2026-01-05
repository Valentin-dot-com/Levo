import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/authenticate';
import { Router } from '@angular/router';
import { filter, take } from 'rxjs';

@Component({
  selector: 'app-auth-callback',
  imports: [],
  templateUrl: './auth-callback.html',
  styleUrl: './auth-callback.scss',
})
export class AuthCallbackComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.auth.session$
      .pipe(
        filter((session) => !!session),
        take(1)
      )
      .subscribe({
        next: () => this.router.navigate(['/home']),
        error: () => this.router.navigate(['/auth']),
      });
  }
}
