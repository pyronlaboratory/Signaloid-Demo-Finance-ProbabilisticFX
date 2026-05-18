import { Injectable, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';

export interface ConversionParams {
  sourceCurrency: string;
  targetCurrency: string;
  amount: number;
  minRate: number;
  maxRate: number;
}

function sameCurrencyValidator(group: AbstractControl): ValidationErrors | null {
  const source = group.get('sourceCurrency')?.value;
  const target = group.get('targetCurrency')?.value;
  return source && target && source === target ? { sameCurrency: true } : null;
}

function rateRangeValidator(group: AbstractControl): ValidationErrors | null {
  const min = parseFloat(group.get('minRate')?.value);
  const max = parseFloat(group.get('maxRate')?.value);
  if (!isNaN(min) && !isNaN(max) && min >= max) {
    return { rateRange: true };
  }
  return null;
}

/**
 * State management store responsible for handling the user configuration lifecycle
 * of asset pairs during currency conversion processes.
 *
 * Manages the reactive state transformations, numeric data parsers, and cross-field
 * validation rules for input parameters prior to downstream computation execution.
 */
@Injectable({ providedIn: 'root' })
export class ConversionStore {
  private _isLoading = signal<boolean>(false);

  isLoading = this._isLoading.asReadonly();
  setLoading(value: boolean): void {
    this._isLoading.set(value);
  }

  form = new FormGroup(
    {
      sourceCurrency: new FormControl<string>('GBP', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      targetCurrency: new FormControl<string>('EUR', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      amount: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^(?!0+(\.0+)?$)\d+(\.\d{0,2})?$/)],
      }),
      minRate: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^(?!0+\.?0*$)\d+(\.\d{0,6})?$/)],
      }),
      maxRate: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^(?!0+\.?0*$)\d+(\.\d{0,6})?$/)],
      }),
    },
    { validators: [sameCurrencyValidator, rateRangeValidator] },
  );

  // Convenience accessors used by templates
  get sourceCurrency() {
    return this.form.controls.sourceCurrency;
  }
  get targetCurrency() {
    return this.form.controls.targetCurrency;
  }
  get amount() {
    return this.form.controls.amount;
  }
  get minRate() {
    return this.form.controls.minRate;
  }
  get maxRate() {
    return this.form.controls.maxRate;
  }

  get params(): ConversionParams {
    const v = this.form.getRawValue();
    return {
      sourceCurrency: v.sourceCurrency,
      targetCurrency: v.targetCurrency,
      amount: parseFloat(v.amount),
      minRate: parseFloat(v.minRate),
      maxRate: parseFloat(v.maxRate),
    };
  }

  isValid(): boolean {
    return this.form.valid;
  }

  dirty(): void {
    this.form.markAllAsTouched();
  }

  reset(): void {
    this._isLoading.set(false);
    this.form.reset({
      sourceCurrency: 'GBP',
      targetCurrency: 'EUR',
      amount: '',
      minRate: '',
      maxRate: '',
    });
  }
}
