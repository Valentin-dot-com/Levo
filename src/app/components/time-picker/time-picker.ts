import {
  Component,
  signal,
  computed,
  forwardRef,
  HostListener,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-time-picker',
  imports: [CommonModule],
  templateUrl: './time-picker.html',
  styleUrls: ['./time-picker.scss'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TimePickerComponent), multi: true },
  ],
})
export class TimePickerComponent implements ControlValueAccessor {
  private el = inject(ElementRef);
  readonly hours = Array.from({ length: 24 }, (_, i) => i);
  readonly minutes = [0, 15, 30, 45];

  readonly focusedHour = signal<number | null>(null);
  readonly focusedMinute = signal<number | null>(null);

  readonly hour = signal<number | null>(null);
  readonly minute = signal<number | null>(null);
  readonly isOpen = signal(false);
  readonly activeColumn = signal<'hour' | 'minute'>('hour');

  @ViewChild('hourList') hourList!: ElementRef<HTMLElement>;
  @ViewChild('minuteList') minuteList!: ElementRef<HTMLElement>;

  readonly displayValue = computed(() => {
    if (this.hour() === null || this.minute() === null) return '';
    return `${this.pad(this.hour()!)}:${this.pad(this.minute()!)}`;
  });

  private onChange?: (value: string | null) => void;
  private onTouched?: () => void;

  writeValue(value: string | null): void {
    if (!value) {
      this.hour.set(null);
      this.minute.set(null);
      return;
    }

    const [h, m] = value.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return;

    this.hour.set(h);
    this.minute.set(m);
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  open() {
    this.isOpen.set(true);
    this.activeColumn.set('hour');

    if (this.hour() === null) this.hour.set(0);
    if (this.minute() === null) this.hour.set(0);

    this.focusedHour.set(this.hour());
    this.focusedMinute.set(this.minute());

    queueMicrotask(() => this.scrollToActive());
  }

  close() {
    this.isOpen.set(false);
    this.onTouched?.();
  }

  selectHour(h: number) {
    this.hour.set(h);
    this.activeColumn.set('minute');
    this.emit();
    this.scrollToActive();
  }

  selectMinute(m: number) {
    this.minute.set(m);
    this.emit();
    this.close();
  }

  private emit() {
    if (this.hour() === null || this.minute() === null) {
      this.onChange?.(null);
      return;
    }

    this.onChange?.(`${this.pad(this.hour()!)}:${this.pad(this.minute()!)}`);
  }

  pad(v: number) {
    return String(v).padStart(2, '0');
  }

  onKeydown(event: KeyboardEvent) {
    if (!this.isOpen()) return;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.step(-1);
        this.focusActiveButton();
        break;

      case 'ArrowDown':
        event.preventDefault();
        this.step(1);
        this.focusActiveButton();
        break;

      case 'ArrowLeft':
        event.preventDefault();
        this.activeColumn.set('hour');
        this.focusActiveButton();
        break;

      case 'ArrowRight':
        event.preventDefault();
        this.activeColumn.set('minute');
        this.focusActiveButton();
        break;

      case 'Enter':
        event.preventDefault();
        if (this.activeColumn() === 'hour') {
          this.hour.set(this.focusedHour());
          this.activeColumn.set('minute');
          this.focusActiveButton();
        } else {
          this.minute.set(this.focusedMinute());
          this.emit();
          this.close();
        }
        break;

      case 'Escape':
        event.preventDefault();
        this.close();
        break;
    }
  }

  private step(delta: number) {
    if (this.activeColumn() === 'hour') {
      const current = this.focusedHour() ?? this.hour() ?? 0;
      const next = (current + delta + 24) % 24;
      this.focusedHour.set(next);
    } else {
      const current = this.focusedMinute() ?? this.minute() ?? 0;
      const index = this.minutes.indexOf(current);
      const nextIndex = (index + delta + this.minutes.length) % this.minutes.length;
      this.focusedMinute.set(this.minutes[nextIndex]);
    }
    this.scrollToActive();
  }

  private scrollToActive() {
    const list =
      this.activeColumn() === 'hour'
        ? this.hourList?.nativeElement
        : this.minuteList?.nativeElement;

    if (!list) return;

    const selected = list.querySelector<HTMLElement>('.selected');
    selected?.scrollIntoView({ block: 'nearest' });
  }

  private focusActiveButton() {
    setTimeout(() => {
      let selector = '';
      if (this.activeColumn() === 'hour') {
        selector = `.column:first-child .option[data-value="${this.focusedHour()}"]`;
      } else {
        selector = `.column:last-child .option[data-value="${this.focusedMinute()}"]`;
      }
      const btn = this.el.nativeElement.querySelector(selector);
      if (btn) (btn as HTMLElement).focus();
    });
  }

  @HostListener('document:click', ['$event'])
  onOutsideClick(e: MouseEvent) {
    if (!(e.target as HTMLElement).closest('app-time-picker')) {
      this.close();
    }
  }
}
