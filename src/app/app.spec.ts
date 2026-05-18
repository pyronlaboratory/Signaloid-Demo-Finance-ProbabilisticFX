// Partially generated using AI assistance.
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { signal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { App } from './app';
import { ConversionStore } from './store/conversion.store';
import { Signaloid } from './services/signaloid';
import { Logger } from './services/logger';

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;

  let mockStore: any;
  let mockSignaloid: any;
  let mockLogger: any;

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

      dirty: vi.fn(),
      isValid: vi.fn().mockReturnValue(true),
      reset: vi.fn(),
      setLoading: vi.fn(),
      isLoading: signal(false),
      params: { amount: 100, minRate: 1.1, maxRate: 1.3 },
      ticker: { value: 'EUR' },
    };

    mockSignaloid = {
      execute: vi.fn(),
    };

    mockLogger = {
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: ConversionStore, useValue: mockStore },
        { provide: Signaloid, useValue: mockSignaloid },
        { provide: Logger, useValue: mockLogger },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should render the correct application title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Probabilistic FX');
  });

  describe('reset()', () => {
    it('should reset component state signals and call store reset', () => {
      component.active.set(true);
      component.result.set({} as any);
      component.errorMessage.set('Error occurred');

      component.reset();

      expect(component.active()).toBe(false);
      expect(component.result()).toBeNull();
      expect(component.errorMessage()).toBeNull();
      expect(mockStore.reset).toHaveBeenCalled();
    });
  });

  describe('convert()', () => {
    it('should abort computation and log warning if the form is invalid', async () => {
      mockStore.isValid.mockReturnValue(false);

      await component.convert();

      expect(mockStore.dirty).toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith('Execution aborted: Form validation failed.');
      expect(mockSignaloid.execute).not.toHaveBeenCalled();
    });

    it('should execute computation successfully and set relevant signals', async () => {
      const mockResultPayload = { summary: 'success' } as any;
      mockSignaloid.execute.mockResolvedValue(mockResultPayload);

      await component.convert();

      expect(mockStore.dirty).toHaveBeenCalled();
      expect(mockStore.setLoading).toHaveBeenCalledWith(true);
      expect(component.active()).toBe(true);
      expect(component.errorMessage()).toBeNull();

      expect(mockSignaloid.execute).toHaveBeenCalledWith({
        amount: 100,
        minRate: 1.1,
        maxRate: 1.3,
      });

      expect(component.result()).toEqual(mockResultPayload);
      expect(component.ticker()).toBe('EUR');
      expect(mockStore.setLoading).toHaveBeenCalledWith(false);
    });

    it('should catch exceptions, display a user-friendly error message, and log details', async () => {
      const mockError = new Error('Network failure');
      mockSignaloid.execute.mockRejectedValue(mockError);

      await component.convert();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Signaloid computation pipeline crashed.',
        mockError,
      );
      expect(component.errorMessage()).toContain('The compute engine encountered an error');
      expect(component.result()).toBeNull();
      expect(mockStore.setLoading).toHaveBeenCalledWith(false);
    });
  });
});
