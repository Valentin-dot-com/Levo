import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FeedbackMessageService {
  readonly success = signal('');
  readonly error = signal('');

  setSuccess(msg: string) {
    this.success.set(msg);
    setTimeout(() => {
      this.success.set('');
    }, 3000);
  }

  setError(msg: string) {
    this.error.set(msg);
    setTimeout(() => {
      this.error.set('');
    }, 5000);
  }
}
