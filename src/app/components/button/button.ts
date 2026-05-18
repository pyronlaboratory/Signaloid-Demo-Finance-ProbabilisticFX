import { Component, input, output } from '@angular/core';

/**
 * A primitive, accessible button wrapper that manages visual variants,
 * loading indicator states, and click event propagation guards.
 */
@Component({
  selector: 'app-button',
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  variant = input<'primary' | 'danger' | 'outline'>('primary');
  type = input<'button' | 'submit' | 'reset'>('button');
  isLoading = input<boolean>(false);
  disabled = input<boolean>(false);
  ariaLabel = input<string | null>(null);
  scrollToTop = input<boolean>(false);
  btnClick = output<void>();

  handleClick(event: Event) {
    if (this.isLoading() || this.disabled()) {
      event.stopPropagation();
      return;
    }

    if (this.scrollToTop()) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    }

    this.btnClick.emit();
  }
}
