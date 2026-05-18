import { Component, inject, signal } from '@angular/core';
import { ConversionStore } from './store/conversion.store';
import { Signaloid, SignaloidResult } from './services/signaloid';
import { Logger } from './services/logger';
import { ConfigPane } from './layouts/config-pane/config-pane';
import { ResultPane } from './layouts/result-pane/result-pane';

/**
 * Root component of the Probabilistic FX application.
 * Manages core application state (loading, results, error handling) and coordinates
 * data flow between user input configurations and the Signaloid compute engine.
 */
@Component({
  selector: 'app-root',
  imports: [ConfigPane, ResultPane],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected store = inject(ConversionStore);
  private signaloid = inject(Signaloid);
  private logger = inject(Logger);

  isLoading = this.store.isLoading;
  active = signal<boolean>(false);
  ticker = signal<string>('');
  result = signal<SignaloidResult | null>(null);
  errorMessage = signal<string | null>(null);

  reset() {
    this.active.set(false);
    this.result.set(null);
    this.errorMessage.set(null);
    this.store.reset();
  }

  async convert() {
    // Triggers visual feedback for invalid form inputs before submission
    this.store.dirty();

    if (!this.store.isValid()) {
      this.logger.warn('Execution aborted: Form validation failed.');
      return;
    }

    try {
      this.store.setLoading(true);
      this.active.set(true);
      this.result.set(null);
      this.errorMessage.set(null);

      const params = this.store.params;
      this.logger.log('Initiating Signaloid computation pipeline with params:', params);

      const data = await this.signaloid.execute({
        amount: params.amount,
        minRate: params.minRate,
        maxRate: params.maxRate,
      });

      this.logger.log('Signaloid computation resolved successfully.', data);
      this.result.set(data);
      this.ticker.set(this.store.targetCurrency.value);
    } catch (err) {
      this.logger.error('Signaloid computation pipeline crashed.', err);

      this.errorMessage.set(
        'The compute engine encountered an error while processing the distribution.',
      );
      this.result.set(null);
    } finally {
      this.store.setLoading(false);
    }
  }
}
