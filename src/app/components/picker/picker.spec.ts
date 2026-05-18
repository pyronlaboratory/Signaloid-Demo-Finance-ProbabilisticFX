// Partially generated using AI assistance.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Picker, PickerOption } from './picker';

describe('Picker', () => {
  let component: Picker;
  let fixture: ComponentFixture<Picker>;

  const mockOptions: PickerOption[] = [
    { value: 'GBP', label: 'British Pound Sterling', imageUrl: 'https://flagcdn.com/w80/gb.png' },
    { value: 'EUR', label: 'Euro', imageUrl: 'https://flagcdn.com/w80/eu.png' },
  ];

  beforeEach(async () => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();

    await TestBed.configureTestingModule({
      imports: [Picker],
    }).compileComponents();

    fixture = TestBed.createComponent(Picker);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', mockOptions);
  });

  it('should initialize with correct default state rules', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.selected()).toBeUndefined();
    expect(component.isOpen()).toBe(false);
  });

  describe('ControlValueAccessor & Form Binding API', () => {
    it('should set selectedValue state signal when writeValue is executed', () => {
      component.writeValue('GBP');
      fixture.detectChanges();

      expect(component.selectedValue()).toBe('GBP');
      expect(component.selected()?.value).toBe('GBP');
    });

    it('should enforce disabled DOM constraints when setDisabledState is called', () => {
      component.isOpen.set(true);
      component.setDisabledState(true);
      fixture.detectChanges();

      expect(component.disabled()).toBe(true);
      expect(component.isOpen()).toBe(false);

      const triggerBtn = fixture.nativeElement.querySelector(
        '.picker-trigger',
      ) as HTMLButtonElement;
      const hostWrapper = fixture.nativeElement.querySelector('.picker') as HTMLDivElement;

      expect(triggerBtn.disabled).toBe(true);
      expect(hostWrapper.classList.contains('is-disabled')).toBe(true);
    });
  });

  describe('User Interactions and Open/Close Toggles', () => {
    it('should toggle openness status on trigger click action events', () => {
      fixture.detectChanges();
      const triggerBtn = fixture.nativeElement.querySelector(
        '.picker-trigger',
      ) as HTMLButtonElement;

      triggerBtn.click();
      expect(component.isOpen()).toBe(true);

      triggerBtn.click();
      expect(component.isOpen()).toBe(false);
    });

    it('should select an option and collapse listbox overlay layout on element clicks', () => {
      fixture.detectChanges();
      const changeSpy = vi.spyOn(component.selectedValueChange, 'emit');

      component.open();
      fixture.detectChanges();

      const options = fixture.nativeElement.querySelectorAll('.picker-option');
      (options[1] as HTMLLIElement).click();

      expect(component.selectedValue()).toBe('EUR');
      expect(changeSpy).toHaveBeenCalledWith('EUR');
      expect(component.isOpen()).toBe(false);
    });

    it('should automatically dismiss dropdown panel visibility when background click events trigger outside boundary context', () => {
      fixture.detectChanges();
      component.open();
      expect(component.isOpen()).toBe(true);

      const foreignElement = document.createElement('div');
      document.body.appendChild(foreignElement);

      component.onOutsideClick({ target: foreignElement } as unknown as MouseEvent);
      fixture.detectChanges();

      expect(component.isOpen()).toBe(false);
      foreignElement.remove();
    });
  });

  describe('Keyboard Accessibility Routing Architecture', () => {
    it('should open popup menu listbox block when trigger captures operational spaces', () => {
      fixture.detectChanges();
      const event = new KeyboardEvent('keydown', { key: ' ' });
      const preventSpy = vi.spyOn(event, 'preventDefault');

      component.onTriggerKeydown(event);

      expect(preventSpy).toHaveBeenCalled();
      expect(component.isOpen()).toBe(true);
    });

    it('should open dropdown and shift focus targets upon trigger engagement', async () => {
      fixture.detectChanges();
      component.open();

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(component.isOpen()).toBe(true);
      expect(component.focusedIndex()).toBe(0);
      expect(document.activeElement).toBe(component.dropdownRef?.nativeElement);
    });

    it('should cycle focus targets linearly back up to top if navigation exceeds array boundaries', () => {
      fixture.detectChanges();
      component.open();

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      component.onDropdownKeydown(event);
      expect(component.focusedIndex()).toBe(1);

      component.onDropdownKeydown(event);
      expect(component.focusedIndex()).toBe(0);
    });

    it('should confirm active highlighted option upon capture of programmatic Enter signals', () => {
      fixture.detectChanges();
      const changeSpy = vi.spyOn(component.selectedValueChange, 'emit');

      component.open();
      component.focusedIndex.set(1);

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      component.onDropdownKeydown(event);

      expect(changeSpy).toHaveBeenCalledWith('EUR');
      expect(component.isOpen()).toBe(false);
    });

    it('should instantly exit options tracking without changing choices on Escape operations', () => {
      fixture.detectChanges();
      component.writeValue('GBP');
      component.open();

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      const preventSpy = vi.spyOn(event, 'preventDefault');

      component.onDropdownKeydown(event);

      expect(preventSpy).toHaveBeenCalled();
      expect(component.isOpen()).toBe(false);
      expect(component.selectedValue()).toBe('GBP');
    });
  });
});
