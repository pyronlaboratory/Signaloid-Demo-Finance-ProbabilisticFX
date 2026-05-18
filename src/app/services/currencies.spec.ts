// Partially generated using AI assistance.
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { Currencies } from './currencies';

describe('Currencies', () => {
  let service: Currencies;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Currencies);
  });

  it('should create the service instance', () => {
    expect(service).toBeTruthy();
  });

  it('should return the list of supported currencies', () => {
    const list = service.getCurrencies();

    expect(list.length).toBe(2);
    expect(list[0].code).toBe('GBP');
    expect(list[1].code).toBe('EUR');
  });

  it('should resolve mapped flag URLs', () => {
    const gbpFlag = service.getFlagUrl('GBP');
    const eurFlag = service.getFlagUrl('EUR');

    expect(gbpFlag).toBe('https://flagcdn.com/w80/gb.png');
    expect(eurFlag).toBe('https://flagcdn.com/w80/eu.png');
  });

  it('should resolve mapped symbols', () => {
    const gbpSymbol = service.getSymbol('GBP');
    const eurSymbol = service.getSymbol('EUR');

    expect(gbpSymbol).toBe('£');
    expect(eurSymbol).toBe('€');
  });
});
