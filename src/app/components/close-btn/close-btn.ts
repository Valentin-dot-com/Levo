import { CommonModule } from "@angular/common";
import { Component, output } from "@angular/core";
import { CloseIconComponent } from "../../icons/closeIcon";

@Component({
  selector: 'app-close-btn',
  imports: [CommonModule, CloseIconComponent],
  templateUrl: './close-btn.html',
  styleUrl: './close-btn.scss'
})
export class CloseBtnComponent {
  closeOverlay = output<void>();

  onClick() {
    this.closeOverlay.emit();
  }
}
