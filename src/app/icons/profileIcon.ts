import { Component } from '@angular/core';

@Component({
  selector: 'app-icon-profile',
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
      aria-label="Icon for profile"
    >
      <path
        d="M18.75 19.6875v-1.875a3.75 3.75 0 0 0 -3.75 -3.75H7.5a3.75 3.75 0 0 0 -3.75 3.75v1.875"
        stroke-width="1.5"
      ></path>
      <path d="M7.5 6.5625a3.75 3.75 0 1 0 7.5 0 3.75 3.75 0 1 0 -7.5 0" stroke-width="1.5"></path>
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
export class ProfileIconComponent {

}
