import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface PickerOption {
  value: string;
  label: string;
  imageUrl?: string;
}

/**
 * A primitive dropdown picker designed for forms.
 */
@Component({
  selector: 'app-picker',
  templateUrl: './picker.html',
  styleUrl: './picker.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: Picker,
      multi: true,
    },
  ],
})
export class Picker implements ControlValueAccessor {
  private elRef = inject(ElementRef);

  label = input<string>('');
  options = input<PickerOption[]>([]);
  selectedValue = signal<string>('');
  selectedValueChange = output<string>();

  @ViewChild('dropdownRef') dropdownRef?: ElementRef<HTMLUListElement>;
  @ViewChild('triggerRef') triggerRef?: ElementRef<HTMLButtonElement>;

  isOpen = signal(false);
  focusedIndex = signal(-1);
  disabled = signal(false);

  protected pickerId = `app-picker-${Math.random().toString(36).substring(2, 9)}`;

  // ControlValueAccessor callbacks and properties
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  selected = computed(() => this.options().find((o) => o.value === this.selectedValue()));

  writeValue(val: string): void {
    this.selectedValue.set(val ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
    if (isDisabled) {
      this.isOpen.set(false);
    }
  }

  open() {
    if (this.disabled() || this.isOpen()) return;
    this.isOpen.set(true);

    const idx = this.options().findIndex((o) => o.value === this.selectedValue());
    this.focusedIndex.set(idx >= 0 ? idx : 0);

    setTimeout(() => {
      this.dropdownRef?.nativeElement.focus();
      this.scrollFocusedIntoView();
    }, 0);
  }

  close() {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.focusedIndex.set(-1);
    this.triggerRef?.nativeElement.focus();
  }

  toggle() {
    this.isOpen() ? this.close() : this.open();
  }

  select(option: PickerOption | undefined) {
    if (!option || this.disabled()) return;
    this.selectedValue.set(option.value);
    this.selectedValueChange.emit(option.value);
    this.onChange(option.value);
    this.onTouched();
    this.close();
  }

  selectFocused() {
    const idx = this.focusedIndex();
    const opts = this.options();
    if (idx >= 0 && idx < opts.length) {
      this.select(opts[idx]);
    }
  }

  moveFocus(delta: 1 | -1) {
    const opts = this.options();
    if (opts.length === 0) return;
    const next = (this.focusedIndex() + delta + opts.length) % opts.length;
    this.focusedIndex.set(next);
    this.scrollFocusedIntoView();
  }

  private scrollFocusedIntoView() {
    const list = this.dropdownRef?.nativeElement;
    const idx = this.focusedIndex();
    if (!list || idx < 0) return;
    const item = list.querySelectorAll<HTMLLIElement>('.picker-option')[idx];
    item?.scrollIntoView({ block: 'nearest' });
  }

  onTriggerKeydown(event: KeyboardEvent) {
    if (this.disabled()) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
      case 'ArrowDown':
        event.preventDefault();
        this.open();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.isOpen.set(true);
        this.focusedIndex.set(this.options().length - 1);
        setTimeout(() => {
          this.dropdownRef?.nativeElement.focus();
          this.scrollFocusedIntoView();
        }, 0);
        break;
    }
  }

  onDropdownKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveFocus(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveFocus(-1);
        break;
      case 'Home':
        event.preventDefault();
        this.focusedIndex.set(0);
        this.scrollFocusedIntoView();
        break;
      case 'End':
        event.preventDefault();
        this.focusedIndex.set(this.options().length - 1);
        this.scrollFocusedIntoView();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectFocused();
        break;
      case 'Tab':
        // Clean close that gives focus back to trigger element
        this.close();
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
    }
  }

  @HostListener('document:click', ['$event'])
  onOutsideClick(event: MouseEvent) {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
      this.focusedIndex.set(-1);
    }
  }
}
