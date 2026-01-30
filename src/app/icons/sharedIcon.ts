import { Component } from '@angular/core';

@Component({
  selector: 'app-icon-shared',
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-0.5 -0.5 16 16"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="icon"
      height="16"
      width="16"
      aria-label="Icon for shared content"
    >
      <path
        d="M10.625 13.125v-1.25a2.5 2.5 0 0 0 -2.5 -2.5H3.125a2.5 2.5 0 0 0 -2.5 2.5v1.25"
        stroke-width="2"
      ></path>
      <path d="M3.125 4.375a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0 -5 0" stroke-width="2"></path>
      <path d="M14.375 13.125v-1.25a2.5 2.5 0 0 0 -1.875 -2.41875" stroke-width="2"></path>
      <path d="M10 1.9562499999999998a2.5 2.5 0 0 1 0 4.84375" stroke-width="2"></path>
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
export class SharedIconComponent {}
