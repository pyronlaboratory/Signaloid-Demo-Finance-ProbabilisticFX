import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ChartStats } from '../../utils/charts.config';
import { StatsCard } from '../../components/stats-card/stats-card';

/**
 * Container component that displays historical statistical metrics.
 */
@Component({
  selector: 'app-result-summary',
  imports: [DecimalPipe, StatsCard],
  templateUrl: './result-summary.html',
  styleUrl: './result-summary.scss',
})
export class ResultSummary {
  stats = input.required<ChartStats>();
}
