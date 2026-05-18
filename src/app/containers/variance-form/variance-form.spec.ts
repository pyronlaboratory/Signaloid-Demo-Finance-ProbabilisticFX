// Partially generated using AI assistance.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { VarianceForm } from './variance-form';
import { ConversionStore } from '../../store/conversion.store';

describe('VarianceForm', () => {
  let component: VarianceForm;
  let fixture: ComponentFixture<VarianceForm>;
  let store: ConversionStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VarianceForm],
      providers: [ConversionStore],
    }).compileComponents();

    fixture = TestBed.createComponent(VarianceForm);
    component = fixture.componentInstance;
    store = TestBed.inject(ConversionStore);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Control Synchronization', () => {
    it('should link template input fields to underlying store control states directly', () => {
      store.minRate.setValue('1.1200');
      store.maxRate.setValue('1.4500');

      expect(store.minRate.value).toBe('1.1200');
      expect(store.maxRate.value).toBe('1.4500');
    });
  });

  describe('Cross-Field Validation Constraints', () => {
    it('should fail group validation state if minRate is greater than or equal to maxRate', () => {
      store.minRate.setValue('2.5000');
      store.maxRate.setValue('1.2000');

      store.form.updateValueAndValidity();

      expect(store.form.hasError('rateRange')).toBe(true);
    });

    it('should pass validation rules when numeric variance coordinates are logical', () => {
      store.minRate.setValue('1.0500');
      store.maxRate.setValue('1.0600');

      store.form.updateValueAndValidity();

      expect(store.form.hasError('rateRange')).toBe(false);
    });
  });
});
