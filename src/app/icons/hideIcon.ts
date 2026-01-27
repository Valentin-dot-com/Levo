import { Component } from '@angular/core';

@Component({
  selector: 'app-icon-hide',
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
      aria-label="Hide"
    >
      <path
        d="M11.2125 11.2125A6.29375 6.29375 0 0 1 7.5 12.5c-4.375 0 -6.875 -5 -6.875 -5a11.53125 11.53125 0 0 1 3.1624999999999996 -3.7125000000000004M6.1875 2.6500000000000004A5.699999999999999 5.699999999999999 0 0 1 7.5 2.5c4.375 0 6.875 5 6.875 5a11.5625 11.5625 0 0 1 -1.35 1.99375m-4.2 -0.6687500000000001a1.875 1.875 0 1 1 -2.6500000000000004 -2.6500000000000004"
        stroke-width="1"
      ></path>
      <path d="m0.625 0.625 13.75 13.75" stroke-width="1"></path>
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
export class HideIconComponent {}
