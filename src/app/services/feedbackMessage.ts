import { Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class FeedbackMessageService {
  success = signal('');
  error = signal('');
}
