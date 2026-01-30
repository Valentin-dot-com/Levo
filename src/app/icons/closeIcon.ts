import { Component } from '@angular/core';

@Component({
  selector: 'app-icon-close',
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="icon"
      height="32"
      width="32"
      aria-label="Icon for a close-sign"
    >
      <path d="M24 8 8 24" stroke-width="2"></path>
      <path d="m8 8 16 16" stroke-width="2"></path>
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      justify-content: center;
      align-items: center;
    }
  `,
})
export class CloseIconComponent {}
