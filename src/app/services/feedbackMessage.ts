import { Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class FeedbackMessageService {
  success = signal('');
  error = signal('');

  setSuccess(msg: string) {
    this.success.set(msg);
  }

  setError(msg: string) {
    this.error.set(msg);
  }
}
