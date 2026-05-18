import { Injectable, signal } from '@angular/core';
import { ChartTheme } from '../utils/charts.config';

/**
 * Service for extracting core theme variables from the DOM.
 *
 * Inspects the document root's computed CSS variables and exposes them as a reactive,
 * read-only signal for Highcharts configuration.
 */
@Injectable({
  providedIn: 'root',
})
export class ChartThemeService {
  private _theme = signal(this.readTheme());
  readonly theme = this._theme.asReadonly();

  private readTheme(): ChartTheme {
    const style = getComputedStyle(document.documentElement);

    return {
      primary: style.getPropertyValue('--primary').trim(),
      accent: style.getPropertyValue('--accent').trim(),
      divider: style.getPropertyValue('--divider').trim(),
      textPrimary: style.getPropertyValue('--text-primary').trim(),
      textAccent: style.getPropertyValue('--text-accent').trim(),
      textSecondary: style.getPropertyValue('--text-secondary').trim(),
      textMuted: style.getPropertyValue('--text-muted').trim(),
      plotLines: style.getPropertyValue('--plot-lines').trim(),
    };
  }
}
