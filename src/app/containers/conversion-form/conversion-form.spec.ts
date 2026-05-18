// Partially generated using AI assistance.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ConversionForm } from './conversion-form';
import { ConversionStore } from '../../store/conversion.store';
import { Currencies } from '../../services/currencies';

describe('ConversionForm', () => {
  let component: ConversionForm;
  let fixture: ComponentFixture<ConversionForm>;
  let store: ConversionStore;
  let mockCurrenciesService: any;

  beforeEach(async () => {
    mockCurrenciesService = {
      getCurrencies: vi.fn().mockReturnValue([
        {
          code: 'GBP',
          name: 'British Sterling',
          symbol: '£',
          flagUrl: 'https://flagcdn.com/w80/gb.png',
        },
        { code: 'EUR', name: 'Euro', symbol: '€', flagUrl: 'https://flagcdn.com/w80/eu.png' },
      ]),
      getSymbol: vi.fn((code: string) => (code === 'EUR' ? '€' : '£')),
    };

    await TestBed.configureTestingModule({
      imports: [ConversionForm],
      providers: [{ provide: Currencies, useValue: mockCurrenciesService }, ConversionStore],
    }).compileComponents();

    fixture = TestBed.createComponent(ConversionForm);
    component = fixture.componentInstance;
    store = TestBed.inject(ConversionStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization and Dropdown Mapping', () => {
    it('should map currencies from service to picker option contracts on load', () => {
      expect(component.currencyOptions.length).toBe(2);
      expect(component.currencyOptions[0]).toEqual({
        value: 'GBP',
        label: 'British Sterling',
        imageUrl: 'https://flagcdn.com/w80/gb.png',
      });
    });

    it('should derive the initial currency symbol accurately via state store values', () => {
      expect(component.currencySymbol()).toBe('£');
    });
  });

  describe('Signal bridge and reactivity tracking', () => {
    it('should update computed currencySymbol output when the source form control updates values', () => {
      store.sourceCurrency.setValue('EUR');
      fixture.detectChanges();

      expect(mockCurrenciesService.getSymbol).toHaveBeenCalledWith('EUR');
      expect(component.currencySymbol()).toBe('€');
    });
  });

  describe('User Interactions', () => {
    it('should swap source and target control values when executing exchange operations', () => {
      store.sourceCurrency.setValue('GBP');
      store.targetCurrency.setValue('EUR');

      component.exchange();

      expect(store.sourceCurrency.value).toBe('EUR');
      expect(store.targetCurrency.value).toBe('GBP');
    });

    it('should trigger exchange routine when clicking the accessibility-labeled switch element', () => {
      const exchangeSpy = vi.spyOn(component, 'exchange');
      const compiled = fixture.nativeElement as HTMLElement;
      const switchBtn = compiled.querySelector('.exchange-switch') as HTMLButtonElement;

      switchBtn.click();
      fixture.detectChanges();

      expect(exchangeSpy).toHaveBeenCalled();
    });
  });
});
