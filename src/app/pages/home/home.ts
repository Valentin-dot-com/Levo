import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/authenticate';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {
  private auth = inject(AuthService);

  signOut() {
    this.auth.signOut();
  }
}
