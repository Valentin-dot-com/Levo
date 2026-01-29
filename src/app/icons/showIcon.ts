import { Component } from '@angular/core';

@Component({
  selector: 'app-icon-show',
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-0.5 -0.5 16 16"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="icon"
      height="16"
      width="16"
      aria-label="Icon for showing"
    >
      <path
        d="M0.625 7.5s2.5 -5 6.875 -5 6.875 5 6.875 5 -2.5 5 -6.875 5 -6.875 -5 -6.875 -5z"
        stroke-width="1"
      ></path>
      <path
        d="M5.625 7.5a1.875 1.875 0 1 0 3.75 0 1.875 1.875 0 1 0 -3.75 0"
        stroke-width="1"
      ></path>
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
export class ShowIconComponent {}
