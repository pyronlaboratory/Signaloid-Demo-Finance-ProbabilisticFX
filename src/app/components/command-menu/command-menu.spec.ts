// Partially generated using AI assistance.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideIcons } from '@ng-icons/core';
import { cssSoftwareDownload } from '@ng-icons/css.gg';
import { CommandMenu, CommandMenuOption } from './command-menu';

describe('CommandMenu', () => {
  let component: CommandMenu;
  let fixture: ComponentFixture<CommandMenu>;

  const mockOptions: CommandMenuOption[] = [
    { key: 'grid', label: 'Show Grid', value: true },
    { key: 'labels', label: 'Show Labels', value: false },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandMenu],
      providers: [provideIcons({ cssSoftwareDownload })],
    }).compileComponents();

    fixture = TestBed.createComponent(CommandMenu);
    component = fixture.componentInstance;
  });

  it('should not render anything when open is false', () => {
    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();

    const menuEl = fixture.nativeElement.querySelector('.command-menu');
    expect(menuEl).toBeNull();
  });

  describe('When Open', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('open', true);
    });

    it('should render the title if provided', () => {
      fixture.componentRef.setInput('title', 'Test Options');
      fixture.detectChanges();

      const titleEl = fixture.nativeElement.querySelector('.menu-label');
      expect(titleEl.textContent).toContain('Test Options');
    });

    it('should not render the title element if unprovided', () => {
      fixture.componentRef.setInput('title', undefined);
      fixture.detectChanges();

      const titleEl = fixture.nativeElement.querySelector('.menu-label');
      expect(titleEl).toBeNull();
    });

    it('should display menu options with correct aria-checked attributes', () => {
      fixture.componentRef.setInput('options', mockOptions);
      fixture.detectChanges();

      const items = fixture.nativeElement.querySelectorAll('.menu-item');
      expect(items.length).toBe(2);
      expect(items[0].getAttribute('aria-checked')).toBe('true');
      expect(items[1].getAttribute('aria-checked')).toBe('false');
    });

    it('should emit the toggle output with the correct key when an option is clicked', () => {
      fixture.componentRef.setInput('options', mockOptions);
      fixture.detectChanges();

      const toggleSpy = vi.spyOn(component.toggle, 'emit');
      const firstItem = fixture.nativeElement.querySelector('.menu-item');

      firstItem.click();
      expect(toggleSpy).toHaveBeenCalledWith('grid');
    });

    it('should stop event propagation when clicked to prevent menu dismissal', () => {
      fixture.detectChanges();
      const menuEl = fixture.nativeElement.querySelector('.command-menu');

      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      const propagationSpy = vi.spyOn(clickEvent, 'stopPropagation');

      menuEl.dispatchEvent(clickEvent);
      expect(propagationSpy).toHaveBeenCalled();
    });

    describe('Action Footer Button', () => {
      it('should render the action button and divider if actionLabel is provided', () => {
        fixture.componentRef.setInput('actionLabel', 'Export Data');
        fixture.detectChanges();

        const dividerEl = fixture.nativeElement.querySelector('.divider');
        const buttonEl = fixture.nativeElement.querySelector('.action-btn');

        expect(dividerEl).toBeTruthy();
        expect(buttonEl.textContent.trim()).toBe('Export Data');
      });

      it('should not render the action footer elements if actionLabel is absent', () => {
        fixture.componentRef.setInput('actionLabel', undefined);
        fixture.detectChanges();

        const buttonEl = fixture.nativeElement.querySelector('.action-btn');
        expect(buttonEl).toBeNull();
      });

      it('should render the icon inside the action button if actionIcon is provided', () => {
        fixture.componentRef.setInput('actionLabel', 'Export');
        fixture.componentRef.setInput('actionIcon', 'cssSoftwareDownload');
        fixture.detectChanges();

        const iconEl = fixture.nativeElement.querySelector('ng-icon');
        expect(iconEl).toBeTruthy();
      });

      it('should emit the action output when the action button is clicked', () => {
        fixture.componentRef.setInput('actionLabel', 'Export');
        fixture.detectChanges();

        const actionSpy = vi.spyOn(component.action, 'emit');
        const buttonEl = fixture.nativeElement.querySelector('.action-btn');

        buttonEl.click();
        expect(actionSpy).toHaveBeenCalled();
      });
    });
  });
});
