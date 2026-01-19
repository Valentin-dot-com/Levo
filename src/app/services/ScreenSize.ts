import { Injectable, signal, DestroyRef, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScreenSizeService {
  private destroyRef = inject(DestroyRef);

  private mobile = signal(false);
  private tablet = signal(false);
  private desktop = signal(false);

  readonly isMobile = this.mobile.asReadonly();
  readonly isTablet = this.tablet.asReadonly();
  readonly isDesktop = this.desktop.asReadonly();

  private mobileQuery = window.matchMedia('(max-width: 767px)');
  private tabletQuery = window.matchMedia('(min-width: 768px) and (max-width: 1299px)');
  private desktopQuery = window.matchMedia('(min-width: 1300px)');

  constructor() {
    this.updateBreakpoints();

    const mobileListener = () => this.mobile.set(this.mobileQuery.matches);
    const tabletListener = () => this.tablet.set(this.tabletQuery.matches);
    const desktopListener = () => this.desktop.set(this.desktopQuery.matches);

    this.mobileQuery.addEventListener('change', mobileListener);
    this.tabletQuery.addEventListener('change', tabletListener);
    this.desktopQuery.addEventListener('change', desktopListener);

    this.destroyRef.onDestroy(() => {
      this.mobileQuery.removeEventListener('change', mobileListener);
      this.tabletQuery.removeEventListener('change', tabletListener);
      this.desktopQuery.removeEventListener('change', desktopListener);
    });
  }

  private updateBreakpoints() {
    this.mobile.set(this.mobileQuery.matches);
    this.tablet.set(this.tabletQuery.matches);
    this.desktop.set(this.desktopQuery.matches);
  }
}
