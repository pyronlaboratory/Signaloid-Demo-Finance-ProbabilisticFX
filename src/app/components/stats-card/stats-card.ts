import { Component, input } from '@angular/core';

/**
 * A primitive card componenet for highlighting single key-performance indicators
 * or statistical metrics.
 */
@Component({
  selector: 'app-stats-card',
  templateUrl: './stats-card.html',
  styleUrl: './stats-card.scss',
})
export class StatsCard {
  label = input.required<string | null>();
  value = input.required<string | null>();
}
