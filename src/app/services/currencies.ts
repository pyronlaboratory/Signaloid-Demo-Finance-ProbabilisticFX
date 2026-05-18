import { Injectable } from '@angular/core';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flagUrl: string;
}

/**
 * Data service for application currency configurations.
 *
 * Maintains a collection of supported currencies and provides lookup maps
 * for country-specific flags and symbols
 */
@Injectable({
  providedIn: 'root',
})
export class Currencies {
  private readonly flagMap: Record<string, string> = {
    GBP: 'gb',
    EUR: 'eu',
  };

  private readonly symbolMap: Record<string, string> = {
    GBP: '£',
    EUR: '€',
  };

  private readonly currencies: Currency[] = [
    {
      code: 'GBP',
      name: 'British Sterling',
      flagUrl: this.getFlagUrl('GBP'),
      symbol: this.getSymbol('GBP'),
    },
    {
      code: 'EUR',
      name: 'Euro',
      flagUrl: this.getFlagUrl('EUR'),
      symbol: this.getSymbol('EUR'),
    },
  ];

  getFlagUrl(code: string): string {
    const countryCode = this.flagMap[code] || code.toLowerCase().substring(0, 2);
    return `https://flagcdn.com/w80/${countryCode}.png`;
  }

  getSymbol(code: string): string {
    return this.symbolMap[code] || '£';
  }

  getCurrencies(): Currency[] {
    return this.currencies;
  }
}
