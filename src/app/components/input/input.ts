import { Component, input, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input',
  templateUrl: './input.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: InputComponent,
      multi: true,
    },
  ],
  styleUrl: './input.scss',
})
export class InputComponent implements ControlValueAccessor {
  label = input<string>('');
  placeholder = input<string>('');
  inputMode = input<'decimal' | 'text' | 'numeric'>('decimal');
  maxDecimalPlaces = input<number | undefined>(undefined);

  valueChange = output<string>();
  blur = output<void>();

  value = signal<string>('');
  disabled = signal<boolean>(false);

  protected inputId = `app-input-${Math.random().toString(36).substring(2, 9)}`;

  // ControlValueAccessor callbacks and properties
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: string): void {
    this.value.set(val ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  /**
   * General change handler to keep state in sync
   */
  onInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.valueChange.emit(val);
    this.onChange(val);
  }

  /**
   * Blocking native input's own scroll-to-change-value behaviour
   */
  onWheel(event: WheelEvent): void {
    const input = event.target as HTMLInputElement;
    if (document.activeElement !== input) return;
    event.preventDefault();
  }

  /**
   * Filter keys based on the active inputMode
   */
  handleKeyDown(event: KeyboardEvent): void {
    const char = event.key;
    const target = event.target as HTMLInputElement;

    const controlKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter'];
    if (controlKeys.includes(char)) return;

    if (this.inputMode() === 'decimal' || this.inputMode() === 'numeric') {
      // Block scientific notation and signs
      if (['e', 'E', '+', '-'].includes(char)) {
        event.preventDefault();
        return;
      }

      const isDigit = /[0-9]/.test(char);
      const isDecimalPoint = char === '.';

      // If it's numeric mode, block the decimal point too
      if (this.inputMode() === 'numeric' && isDecimalPoint) {
        event.preventDefault();
        return;
      }

      // Block non-digits and prevent double decimals
      if (!isDigit && !isDecimalPoint) {
        event.preventDefault();
      }
      if (isDecimalPoint && target.value.includes('.')) {
        event.preventDefault();
      }
    }
  }

  /**
   * Apply formatting
   */
  handleBlur(event: FocusEvent): void {
    const element = event.target as HTMLInputElement;
    let val = element.value.trim();

    if (this.inputMode() === 'decimal') {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        const maxDec = this.maxDecimalPlaces();
        if (maxDec !== undefined) {
          val = num.toFixed(maxDec);
        } else {
          val = num.toFixed(Math.max(2, (val.split('.')[1] ?? '').length));
        }
      }

      element.value = val;
      this.value.set(val);
      this.valueChange.emit(val);
      this.onChange(val);
    }

    this.onTouched();
    this.blur.emit();
  }
}
