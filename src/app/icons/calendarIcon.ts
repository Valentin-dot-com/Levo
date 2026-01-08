import { Component } from '@angular/core';

@Component({
  selector: 'app-icon-calendar',
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-0.75 -0.75 24 24"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="icon"
      height="24"
      width="24"
    >
      <path
        d="M4.6875 3.75h13.125s1.875 0 1.875 1.875v13.125s0 1.875 -1.875 1.875H4.6875s-1.875 0 -1.875 -1.875V5.625s0 -1.875 1.875 -1.875"
        stroke-width="1.5"
      ></path>
      <path d="m15 1.875 0 3.75" stroke-width="1.5"></path>
      <path d="m7.5 1.875 0 3.75" stroke-width="1.5"></path>
      <path d="m2.8125 9.375 16.875 0" stroke-width="1.5"></path>
    </svg>
  `,
})
export class CalendarIconComponent {}
