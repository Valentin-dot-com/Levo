import { Injectable, signal, computed, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Injectable({ providedIn: 'root' })
export class ScreenSizeService {
  private bp = inject(BreakpointObserver);

  private handset = signal(false);
  private tablet = signal(false);
  private desktop = signal(false);

  readonly isHandset = computed(() => this.handset());
  readonly isTablet = computed(() => this.tablet());
  readonly isDesktop = computed(() => this.desktop());

  constructor() {
    this.bp.observe([
      Breakpoints.Handset,
      Breakpoints.Tablet,
      Breakpoints.Web,
    ]).subscribe(result => {
      this.handset.set(result.breakpoints[Breakpoints.Handset] ?? false);
      this.tablet.set(result.breakpoints[Breakpoints.Tablet] ?? false);
      this.desktop.set(result.breakpoints[Breakpoints.Web] ?? false);
    });
  }
}
