import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, forwardRef, HostListener, input, signal } from "@angular/core";
import { Calendar } from "../../models/calendar.model";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { ArrowRightIconComponent } from "../../icons/arrowRightIcon";

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
    }
  ]
})
export class CustomSelectorComponent implements AfterViewInit, ControlValueAccessor {
  options = input.required<Calendar[]>();

  isOpen = signal(false);
  selectedOption = signal('');

  onChange?: (value: string) => void;
  onTouched?: () => void;

  ngAfterViewInit(): void {
    if (this.options()) {
      this.selectedOption.set(this.options()[0].name);
    }
  }

  toggle() {
    this.isOpen.update(open => !open);
  }

  select(option: Calendar) {
    this.selectedOption.set(option.name);
    if (this.onChange) {
      this.onChange(option.id);
    }
    this.isOpen.set(false);
  }

  writeValue(value: string): void {
    const calendar = this.options().find(cal => cal.id === value)
    this.selectedOption.set(calendar?.name || '');
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
