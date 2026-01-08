import { Component } from '@angular/core';

@Component({
  selector: 'app-icon-home',
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-0.5 -0.5 16 16"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="icon"
      height="24"
      width="24"
    >
      <path
        d="m1.875 5.625 5.625 -4.375 5.625 4.375v6.875a1.25 1.25 0 0 1 -1.25 1.25H3.125a1.25 1.25 0 0 1 -1.25 -1.25z"
        stroke-width="1"
      ></path>
      <path d="m5.625 13.75 0 -6.25 3.75 0 0 6.25" stroke-width="1"></path>
    </svg>
  `,
})
export class HomeIconComponent {}
