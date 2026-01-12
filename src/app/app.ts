import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/authenticate';
import { AsyncPipe } from '@angular/common';
import { LoaderComponent } from './components/loader/loader';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AsyncPipe, LoaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Levo');
  private auth = inject(AuthService);

  isLoading$ = this.auth.isLoading$;
}
