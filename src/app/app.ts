import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/authenticate';
import { AsyncPipe } from '@angular/common';
import { LoaderComponent } from './components/loader/loader';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AsyncPipe, LoaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('Levo');
  private auth = inject(AuthService);

  isLoading$ = this.auth.isLoading$;

  ngOnInit() {
    if (this.isiOS() && window.visualViewport) {
      console.log('Ios resize')
      window.visualViewport.addEventListener('resize', () => {
        document.body.style.height = window.visualViewport!.height + 'px';
      });
    }
  }

  private isiOS(): boolean {
    return /iPhone|iPad|iPod/.test(navigator.userAgent);
  }
}
