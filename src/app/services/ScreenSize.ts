import { Injectable, signal, inject } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';

@Injectable({ providedIn: 'root' })
export class ScreenSizeService {
  private bp = inject(BreakpointObserver);

  private mobile = signal(false);
  private tablet = signal(false);
  private desktop = signal(false);

  readonly isMobile = this.mobile.asReadonly();
  readonly isTablet = this.tablet.asReadonly();
  readonly isDesktop = this.desktop.asReadonly();

  constructor() {
    this.bp
      .observe([
        '(max-width: 767px)',
        '(min-width: 768px) and (max-width: 1299px)',
        '(min-width: 1300px)',
      ])
      .subscribe((result) => {
        this.mobile.set(result.breakpoints['(max-width: 767px)'] ?? false);
        this.tablet.set(result.breakpoints['(min-width: 768px) and (max-width: 1299px)'] ?? false);
        this.desktop.set(result.breakpoints['(min-width: 1300px)'] ?? false);
      });
  }
}
