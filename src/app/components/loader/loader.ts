import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.html',
  styleUrl: './loader.scss',
})
export class LoaderComponent {
}
