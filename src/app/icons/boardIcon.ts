import { Component } from '@angular/core';

@Component({
  selector: 'app-icon-board',
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-0.75 -0.75 24 24"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="icon"
      height="24"
      width="24"
    >
      <path d="M2.8125 2.8125h6.5625v6.5625H2.8125Z" stroke-width="1.5"></path>
      <path d="M13.125 2.8125h6.5625v6.5625h-6.5625Z" stroke-width="1.5"></path>
      <path d="M13.125 13.125h6.5625v6.5625h-6.5625Z" stroke-width="1.5"></path>
      <path d="M2.8125 13.125h6.5625v6.5625H2.8125Z" stroke-width="1.5"></path>
    </svg>
  `,
})
export class BoardIconComponent {

}
