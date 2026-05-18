import { Component, computed, input, output, signal } from '@angular/core';

import { SignaloidResult } from '../../services/signaloid';
import { ResultSummary } from '../../containers/result-summary/result-summary';
import { ExportStatus, ResultCharts } from '../../containers/result-charts/result-charts';
import { Button } from '../../components/button/button';
import { Toast, ToastMessage } from '../../components/toast/toast';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { cssRedo } from '@ng-icons/css.gg';

/**
 * Interface representing derived statistical metrics calculated from the
 * distribution samples.
 */
export interface ComputedStats {
  mean: number;
  min: number;
  max: number;
  std: number;
  ciLower: number;
  ciUpper: number;
}

/**
 * Layout container that processes computational distribution samples from Signaloid.
 * Handles the linear calculation of statistical spreads and renders downstream
 * graphical data and metrics.
 */
@Component({
  selector: 'app-result-pane',
  imports: [NgIcon, ResultSummary, ResultCharts, Button, Toast],
  providers: [provideIcons({ cssRedo })],
  templateUrl: './result-pane.html',
  styleUrl: './result-pane.scss',
})
export class ResultPane {
  result = input<SignaloidResult | null>(null);
  ticker = input<string>('');
  error = input<string | null>(null);
  refresh = output<void>();

  toastMessage = signal<ToastMessage>({ text: '', type: 'info' });

  stats = computed(() => {
    const data = this.result();
    if (!data?.samples?.length) return null;

    const { mean, samples } = data;
    let min = samples[0];
    let max = samples[0];
    let sumOfSquaredDiffs = 0;

    for (let i = 0; i < samples.length; i++) {
      const val = samples[i];
      if (val < min) min = val;
      if (val > max) max = val;
      sumOfSquaredDiffs += (val - mean) ** 2;
    }

    const std = Math.sqrt(sumOfSquaredDiffs / samples.length);

    return { mean, min, max, std, ciLower: mean - 1.96 * std, ciUpper: mean + 1.96 * std };
  });

  onExportStatus(status: ExportStatus) {
    this.toastMessage.set(
      status === 'success'
        ? { text: 'Your download has started successfully.', type: 'success' }
        : { text: 'Export failed. Please check your connection and try again.', type: 'error' },
    );
  }
}
