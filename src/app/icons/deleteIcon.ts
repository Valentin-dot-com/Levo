import { Component } from '@angular/core';

@Component({
  selector: 'app-icon-delete',
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-0.25 -0.5 16 16"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="icon"
      height="24"
      width="24"
    >
      <path d="m1.875 3.75 1.25 0 10 0" stroke-width="1.1"></path>
      <path
        d="M11.875 3.75v8.75a1.25 1.25 0 0 1 -1.25 1.25H4.375a1.25 1.25 0 0 1 -1.25 -1.25V3.75m1.875 0V2.5a1.25 1.25 0 0 1 1.25 -1.25h2.5a1.25 1.25 0 0 1 1.25 1.25v1.25"
        stroke-width="1.1"
      ></path>
      <path d="m6.25 6.875 0 3.75" stroke-width="1.1"></path>
      <path d="m8.75 6.875 0 3.75" stroke-width="1.1"></path>
    </svg>
  `,
})
export class DeleteIconComponent {}
