import { Component } from '@angular/core';

@Component({
  selector: 'app-icon-add',
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
      aria-label="Icon for a plus-sign"
    >
      <path d="m16 6.666666666666666 0 18.666666666666664" stroke-width="2"></path>
      <path d="m6.666666666666666 16 18.666666666666664 0" stroke-width="2"></path>
    </svg>
  `,
})
export class AddIconComponent {}
