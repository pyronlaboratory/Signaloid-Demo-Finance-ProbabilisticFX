import { Component, input, signal, effect, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { cssCheckO, cssInfo, cssClose } from '@ng-icons/css.gg';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  text: string;
  type: ToastType;
}

/**
 * A primtive notification toast component
 */
@Component({
  selector: 'app-toast',
  imports: [NgIcon],
  providers: [provideIcons({ cssCheckO, cssInfo, cssClose })],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class Toast {
  message = input.required<ToastMessage>();
  duration = input<number>(3000);
  closed = output<void>();
  visible = signal(false);
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const currentMessage = this.message();
      if (!currentMessage || !currentMessage.text.trim()) return;
      this.show();
    });
  }

  private show(): void {
    this.clearTimer();
    this.visible.set(true);
    this.timer = setTimeout(() => this.dismiss(), this.duration());
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  dismiss(): void {
    this.visible.set(false);
    this.clearTimer();
    this.closed.emit();
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}
