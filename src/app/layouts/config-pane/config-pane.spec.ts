// Partially generated using AI assistance.
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { signal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ConfigPane } from './config-pane';
import { ConversionStore } from '../../store/conversion.store';

describe('ConfigPane', () => {
  let component: ConfigPane;
  let fixture: ComponentFixture<ConfigPane>;

  let mockStore: any;

  beforeEach(async () => {
    const mockForm = new FormGroup({
      sourceCurrency: new FormControl('GBP'),
      targetCurrency: new FormControl('EUR'),
      amount: new FormControl(''),
      minRate: new FormControl(''),
      maxRate: new FormControl(''),
    });

    mockStore = {
      form: mockForm,
      sourceCurrency: mockForm.controls.sourceCurrency,
      targetCurrency: mockForm.controls.targetCurrency,
      amount: mockForm.controls.amount,
      minRate: mockForm.controls.minRate,
      maxRate: mockForm.controls.maxRate,

      isLoading: signal(false),
    };

    await TestBed.configureTestingModule({
      imports: [ConfigPane],
      providers: [{ provide: ConversionStore, useValue: mockStore }],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfigPane);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('active', false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('primaryAction', () => {
    it('should return default text values when inactive and not loading', () => {
      const state = component.primaryAction();
      expect(state.text).toBe('Convert');
      expect(state.ariaLabel).toBe('Convert currencies');
    });

    it('should return recompute text values when active and not loading', () => {
      fixture.componentRef.setInput('active', true);
      fixture.detectChanges();

      const state = component.primaryAction();
      expect(state.text).toBe('Recompute');
      expect(state.ariaLabel).toBe('Recompute conversion');
    });

    it('should return converting text values when store is loading regardless of active input state', () => {
      mockStore.isLoading.set(true);
      fixture.componentRef.setInput('active', true);
      fixture.detectChanges();

      const state = component.primaryAction();
      expect(state.text).toBe('Converting..');
      expect(state.ariaLabel).toBe('Processing conversion');
    });
  });
});
