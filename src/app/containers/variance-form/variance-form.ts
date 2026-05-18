import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { ConversionStore } from '../../store/conversion.store';
import { InputComponent } from '../../components/input/input';

/**
 * Container component to manage the bounded minimum and maximum distribution
 * rate inputs.
 */
@Component({
  selector: 'app-variance-form',
  imports: [ReactiveFormsModule, InputComponent],
  templateUrl: './variance-form.html',
  styleUrl: './variance-form.scss',
})
export class VarianceForm {
  protected store = inject(ConversionStore);
}
