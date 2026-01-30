import { Component } from '@angular/core';

@Component({
  selector: 'app-icon-list',
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="id"
      height="24"
      width="24"
      aria-label="Icon for a list"
    >
      <path d="m8 6 13 0" stroke-width="2"></path>
      <path d="m8 12 13 0" stroke-width="2"></path>
      <path d="m8 18 13 0" stroke-width="2"></path>
      <path d="m3 6 0.01 0" stroke-width="2"></path>
      <path d="m3 12 0.01 0" stroke-width="2"></path>
      <path d="m3 18 0.01 0" stroke-width="2"></path>
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
export class ListIconComponent {}
