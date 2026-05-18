// Partially generated using AI assistance.
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { ConversionStore } from './conversion.store';

describe('ConversionStore', () => {
  let store: ConversionStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConversionStore],
    });
    store = TestBed.inject(ConversionStore);
  });

  it('should initialize with default states and values', () => {
    expect(store).toBeTruthy();
    expect(store.isLoading()).toBe(false);
    expect(store.form.valid).toBe(false);
    expect(store.sourceCurrency.value).toBe('GBP');
    expect(store.targetCurrency.value).toBe('EUR');
    expect(store.amount.value).toBe('');
    expect(store.minRate.value).toBe('');
    expect(store.maxRate.value).toBe('');
  });

  describe('Loading State Signal', () => {
    it('should mutate the loading signal cleanly through its setter', () => {
      expect(store.isLoading()).toBe(false);
      store.setLoading(true);
      expect(store.isLoading()).toBe(true);
    });
  });

  describe('Field-Level Target Validators', () => {
    describe('amount / minRate / maxRate regex validation mechanics', () => {
      it('should invalidate empty, alphabetic, negative, or zero values via pattern rules', () => {
        store.amount.setValue('abc');
        expect(store.amount.hasError('pattern')).toBe(true);

        store.amount.setValue('-10.50');
        expect(store.amount.hasError('pattern')).toBe(true);

        store.amount.setValue('0');
        expect(store.amount.hasError('pattern')).toBe(true);

        store.amount.setValue('0.00');
        expect(store.amount.hasError('pattern')).toBe(true);
      });

      it('should accept trailing decimal points to allow seamless user typing states', () => {
        store.amount.setValue('1.');
        expect(store.amount.errors).toBeNull();

        store.minRate.setValue('0.');
        expect(store.minRate.hasError('pattern')).toBe(true);
      });

      it('should restrict decimal precision configurations appropriately', () => {
        store.amount.setValue('100.123');
        expect(store.amount.hasError('pattern')).toBe(true);
        store.amount.setValue('100.12');
        expect(store.amount.errors).toBeNull();

        store.minRate.setValue('1.1234567');
        expect(store.minRate.hasError('pattern')).toBe(true);
        store.minRate.setValue('1.123456');
        expect(store.minRate.errors).toBeNull();
      });
    });
  });

  describe('Cross-Field Group Validators', () => {
    describe('sameCurrencyValidator', () => {
      it('should trip validation mismatch if source and target currency are identical', () => {
        store.form.patchValue({
          sourceCurrency: 'GBP',
          targetCurrency: 'GBP',
        });

        expect(store.form.hasError('sameCurrency')).toBe(true);
      });

      it('should pass cross validation if currencies differ', () => {
        store.form.patchValue({
          sourceCurrency: 'GBP',
          targetCurrency: 'EUR',
        });

        expect(store.form.hasError('sameCurrency')).toBe(false);
      });
    });

    describe('rateRangeValidator', () => {
      it('should trip error flag if minRate equalizes or exceeds maxRate value parameters', () => {
        store.form.patchValue({
          minRate: '1.35',
          maxRate: '1.25',
        });
        expect(store.form.hasError('rateRange')).toBe(true);

        store.form.patchValue({
          minRate: '1.25',
          maxRate: '1.25',
        });
        expect(store.form.hasError('rateRange')).toBe(true);
      });

      it('should pass validation bounds when minRate stays underneath maxRate values', () => {
        store.form.patchValue({
          minRate: '1.25',
          maxRate: '1.35',
        });
        expect(store.form.hasError('rateRange')).toBe(false);
      });
    });
  });

  describe('Utility Structural Workflows', () => {
    it('should accurately transform text inputs into numeric values via the params getter', () => {
      store.form.setValue({
        sourceCurrency: 'EUR',
        targetCurrency: 'GBP',
        amount: '250.50',
        minRate: '0.85',
        maxRate: '0.89',
      });

      expect(store.params).toEqual({
        sourceCurrency: 'EUR',
        targetCurrency: 'GBP',
        amount: 250.5,
        minRate: 0.85,
        maxRate: 0.89,
      });
    });

    it('should reflect form validity assertions through isValid helper execution wrapper', () => {
      expect(store.isValid()).toBe(false);

      store.form.setValue({
        sourceCurrency: 'GBP',
        targetCurrency: 'EUR',
        amount: '1500',
        minRate: '1.12',
        maxRate: '1.18',
      });

      expect(store.isValid()).toBe(true);
    });

    it('should mark all controls as touched when calling dirty()', () => {
      expect(store.form.touched).toBe(false);
      store.dirty();
      expect(store.form.touched).toBe(true);
      expect(store.amount.touched).toBe(true);
    });

    it('should purge runtime values, reset loading states and restore defaults under reset routines', () => {
      store.setLoading(true);
      store.form.setValue({
        sourceCurrency: 'EUR',
        targetCurrency: 'GBP',
        amount: '50',
        minRate: '0.85',
        maxRate: '0.88',
      });

      store.reset();

      expect(store.isLoading()).toBe(false);
      expect(store.sourceCurrency.value).toBe('GBP');
      expect(store.targetCurrency.value).toBe('EUR');
      expect(store.amount.value).toBe('');
    });
  });
});
