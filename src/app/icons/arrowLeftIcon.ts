import { Component } from '@angular/core';

@Component({
  selector: 'app-icon-arrow-left',
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="1 0 32 32"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="icon"
      height="32"
      width="32"
      aria-label="Icon for a arrow pointing left"
    >
      <path d="m20 24 -8 -8 8 -8" stroke-width="2"></path>
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      justify-content: center;
      align-items: center;
    }
  `
})
export class ArrowLeftIconComponent {}
