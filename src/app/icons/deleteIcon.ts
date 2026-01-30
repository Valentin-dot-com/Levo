import { Component } from '@angular/core';

@Component({
  selector: 'app-icon-delete',
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="icon"
      height="24"
      width="24"
      aria-label="Icon for delete"
    >
      <path d="m3 6 2 0 16 0" stroke-width="2"></path>
      <path
        d="M19 6v14a2 2 0 0 1 -2 2H7a2 2 0 0 1 -2 -2V6m3 0V4a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v2"
        stroke-width="2"
      ></path>
      <path d="m10 11 0 6" stroke-width="2"></path>
      <path d="m14 11 0 6" stroke-width="2"></path>
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
export class DeleteIconComponent {}
