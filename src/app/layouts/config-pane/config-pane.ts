import { Component, computed, inject, input, output } from '@angular/core';
import { ConversionStore } from '../../store/conversion.store';
import { ConversionForm } from '../../containers/conversion-form/conversion-form';
import { VarianceForm } from '../../containers/variance-form/variance-form';
import { Button } from '../../components/button/button';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { cssArrowRight } from '@ng-icons/css.gg';

/**
 * Layout container that combines conversion and variance parameters, providing
 * interactive control flows (`convert`, `reset`) to drive the core compute cycle.
 */
@Component({
  selector: 'app-config-pane',
  imports: [NgIcon, ConversionForm, VarianceForm, Button],
  providers: [provideIcons({ cssArrowRight })],
  templateUrl: './config-pane.html',
  styleUrl: './config-pane.scss',
})
export class ConfigPane {
  protected store = inject(ConversionStore);
  protected isLoading = this.store.isLoading;

  active = input<boolean>(false);
  convert = output<void>();
  reset = output<void>();

  // Consolidates button metadata to ensure UI copy and screen-reader context
  // match state variations
  primaryAction = computed(() => {
    if (this.isLoading()) {
      return {
        text: 'Converting..',
        ariaLabel: 'Processing conversion',
      };
    }

    if (this.active()) {
      return {
        text: 'Recompute',
        ariaLabel: 'Recompute conversion',
      };
    }

    return {
      text: 'Convert',
      ariaLabel: 'Convert currencies',
    };
  });
}
