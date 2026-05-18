import { Component, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

export interface CommandMenuOption {
  key: string;
  label: string;
  value: boolean;
}

export interface CommandMenuAction {
  label: string;
  icon?: string;
}

/**
 * A primitive, overlay menu that displays toggleable preferences and
 * primary action buttons.
 */
@Component({
  selector: 'app-command-menu',
  imports: [NgIcon],
  templateUrl: './command-menu.html',
  styleUrl: './command-menu.scss',
})
export class CommandMenu {
  open = input.required<boolean>();
  title = input<string>();
  options = input<CommandMenuOption[]>([]);
  actionLabel = input<string>();
  actionIcon = input<string>();

  toggle = output<string>();
  action = output();
}
