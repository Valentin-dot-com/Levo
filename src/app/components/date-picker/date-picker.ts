import {
  Component,
  inject,
  signal,
  computed,
  ViewChild,
  ElementRef,
  forwardRef,
} from '@angular/core';
import { CalendarViewService } from '../../services/calendarView';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarDay } from '../../models/calendar.model';
import { ArrowLeftIconComponent } from '../../icons/arrowLeftIcon';
import { ArrowRightIconComponent } from '../../icons/arrowRightIcon';
import { CalendarIconComponent } from '../../icons/calendarIcon';
import { format, isValid, parseISO } from 'date-fns';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DeleteIconComponent } from '../../icons/deleteIcon';
import { CloseIconComponent } from '../../icons/closeIcon';

@Component({
  selector: 'app-date-picker',
  imports: [
    CommonModule,
    ArrowLeftIconComponent,
    ArrowRightIconComponent,
    CalendarIconComponent,
    FormsModule,
    DeleteIconComponent,
    CloseIconComponent
  ],
  templateUrl: './date-picker.html',
  styleUrls: ['./date-picker.scss'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DatePickerComponent), multi: true },
  ],
})
export class DatePickerComponent implements ControlValueAccessor {
  inputText = '';
  private calendarView = inject(CalendarViewService);
  private hostRef = inject(ElementRef);

  @ViewChild('input', { static: true })
  inputRef!: ElementRef<HTMLInputElement>;

  readonly isOpen = signal(false);
  readonly selectedDate = signal<Date | null>(null);
  readonly focusedDate = signal<Date | null>(null);

  readonly currentYear = this.calendarView.currentYear;
  readonly currentMonth = this.calendarView.currentMonth;
  readonly monthLabel = this.calendarView.monthName;

  readonly loading = signal(true);

  readonly month = computed(() =>
    this.calendarView.generateMonth(new Date(this.currentYear(), Number(this.currentMonth())))
  );

  readonly days = computed(() => this.month().days);

  private onChange?: (value: string | null) => void;
  private onTouched?: () => void;

  writeValue(value: string | null): void {
    if (!value) {
      this.selectedDate.set(null);
      this.focusedDate.set(null);
      this.inputText = '';
      return;
    }

    const parsed = parseISO(value);
    if (!isValid(parsed)) return;

    this.selectedDate.set(parsed);
    this.focusedDate.set(parsed);
    this.calendarView.goToMonth(parsed.getFullYear(), parsed.getMonth());
    this.inputText = this.formatDate(parsed);
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    if (disabled) {
      this.inputRef.nativeElement.disabled = true;
    }
  }

  toggleOpen() {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen.set(true);

    const initial =
      this.selectedDate() ??
      this.days().find((d) => d.isToday)?.date ??
      this.days().find((d) => d.isCurrentMonth)?.date ??
      new Date();

    if (initial) this.focusedDate.set(initial);
    this.focusActiveDayButton();
  }

  close() {
    this.isOpen.set(false);
  }

  clear() {
    this.inputText = '';
    this.selectedDate.set(null);
    this.focusedDate.set(null);
    this.onChange?.(null);
    this.onTouched?.();
    const today = new Date();
    this.calendarView.goToMonth(today.getFullYear(), today.getMonth());
  }

  onInput(value: string) {
    this.inputText = value;
    const parsed = parseISO(value);
    if (isValid(parsed)) {
      this.selectedDate.set(parsed);
      this.focusedDate.set(parsed);
      this.calendarView.goToMonth(parsed.getFullYear(), parsed.getMonth());
      this.onChange?.(value);
    } else {
      this.selectedDate.set(null);
      this.focusedDate.set(null);
      this.onChange?.(null);
    }
  }

  formatDate(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }

  select(day: CalendarDay) {
    const value = this.formatDate(day.date);
    this.selectedDate.set(day.date);
    this.focusedDate.set(day.date);
    this.inputText = value;
    this.onChange?.(value);
    this.onTouched?.();
    this.close();
  }

  onKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowRight':
        this.moveFocus(1);
        break;
      case 'ArrowLeft':
        this.moveFocus(-1);
        break;
      case 'ArrowDown':
        this.moveFocus(7);
        break;
      case 'ArrowUp':
        this.moveFocus(-7);
        break;
      case 'Home':
        this.moveToWeekEdge(true);
        break;
      case 'End':
        this.moveToWeekEdge(false);
        break;
      case 'PageDown':
        this.calendarView.goToNextMonth();
        break;
      case 'PageUp':
        this.calendarView.goToPreviousMonth();
        break;
      case 'Enter':
      case ' ':
        this.selectFocused();
        break;
      case 'Escape':
        this.close();
        break;
      default:
        return;
    }

    event.preventDefault();
  }

  isFocused(day: CalendarDay): boolean {
    return !!this.focusedDate() && day.date.toDateString() === this.focusedDate()!.toDateString();
  }

  isSelected(day: CalendarDay): boolean {
    return !!this.selectedDate() && day.date.toDateString() === this.selectedDate()!.toDateString();
  }

  private focusActiveDayButton() {
    setTimeout(() => {
      const active = this.hostRef.nativeElement.querySelector('.calendar-day[tabindex="0"]') as HTMLElement | null;
      if (active) {
        try {
          active.focus({ preventScroll: true });
        } catch {
          active.focus();
        }
      }
    });
  }

  private moveFocus(offset: number) {
    const flat = this.days();
    const index = flat.findIndex((d) => this.isFocused(d));
    const next = flat[index + offset];

    if (!next) return;

    this.focusedDate.set(next.date);

    if (!next.isCurrentMonth) {
      this.calendarView.goToMonth(next.date.getFullYear(), next.date.getMonth());
    }
    this.focusActiveDayButton();
  }

  private moveToWeekEdge(start: boolean) {
    const flat = this.days();
    const index = flat.findIndex((d) => this.isFocused(d));
    if (index === -1) return;

    const weekStart = Math.floor(index / 7) * 7;
    const target = start ? flat[weekStart] : flat[weekStart + 6];

    if (target) this.focusedDate.set(target.date);
    this.focusActiveDayButton();
  }

  private selectFocused() {
    const day = this.days().find((d) => this.isFocused(d));
    if (day) this.select(day);
  }

  get weekDayNames() {
    return this.calendarView.weekDays;
  }

  async goToPrevious() {
    await this.calendarView.goToPreviousMonth();
  }

  async goToNext() {
    await this.calendarView.goToNextMonth();
  }
}
