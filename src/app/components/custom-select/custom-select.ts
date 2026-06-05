import { CommonModule } from '@angular/common';
import { Component, computed, forwardRef, HostListener, input, signal } from '@angular/core';
import { Calendar } from '../../models/calendar.model';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ArrowRightIconComponent } from '../../icons/arrowRightIcon';

@Component({
  selector: 'app-custom-selector',
  imports: [CommonModule, ArrowRightIconComponent],
  templateUrl: './custom-selector.html',
  styleUrl: './custom-selector.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSelectorComponent),
      multi: true,
    },
  ],
})
export class CustomSelectorComponent implements ControlValueAccessor {
  options = input.required<Calendar[]>();

  isOpen = signal(false);
  private selectedOption = signal('');

  onChange?: (value: string) => void;
  onTouched?: () => void;

  selectedLabel = computed(() => {
    const options = this.options();
    const selectedId = this.selectedOption();
    const selected = options.find((option) => option.id === selectedId);

    if (selected) {
      return selected.name;
    }

    if (!selectedId && options.length) {
      return options[0].name;
    }

    return '';
  });

  toggle() {
    this.isOpen.update((open) => !open);
  }

  select(option: Calendar) {
    this.selectedOption.set(option.id);
    if (this.onChange) {
      this.onChange(option.id);
    }
    if (this.onTouched) {
      this.onTouched();
    }
    this.isOpen.set(false);
  }

  writeValue(value: string): void {
    this.selectedOption.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.selector-container')) {
      this.isOpen.set(false);
    }
  }
}
