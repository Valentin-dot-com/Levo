import { CommonModule } from "@angular/common";
import { Component, output } from "@angular/core";
import { AddIconComponent } from "../../icons/addIcon";

@Component({
  selector: 'app-close-btn',
  imports: [CommonModule, AddIconComponent],
  templateUrl: './close-btn.html',
  styleUrl: './close-btn.scss'
})
export class CloseBtnComponent {
  closeOverlay = output<void>();

  onClick() {
    this.closeOverlay.emit();
  }
}
