// Partially generated using AI assistance.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InputComponent } from './input';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
  });

  it('should compile successfully', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ControlValueAccessor Integration', () => {
    it('should update the internally tracked signal value when writeValue runs', () => {
      component.writeValue('42.00');
      expect(component.value()).toBe('42.00');
    });

    it('should reflect disabled status downstream onto the inner HTML layout node', () => {
      component.setDisabledState(true);
      fixture.detectChanges();

      const inputEl = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(inputEl.disabled).toBe(true);
    });
  });

  describe('Input Key Filtering Rules', () => {
    it('should prevent invalid exponent symbols in numeric and decimal states', () => {
      fixture.componentRef.setInput('inputMode', 'numeric');
      fixture.detectChanges();

      const event = new KeyboardEvent('keydown', { key: 'e', cancelable: true });
      const preventSpy = vi.spyOn(event, 'preventDefault');

      component.handleKeyDown(event);
      expect(preventSpy).toHaveBeenCalled();
    });

    it('should block multiple decimal periods inside a single line entry', () => {
      fixture.componentRef.setInput('inputMode', 'decimal');
      component.value.set('123.45');
      fixture.detectChanges();

      const inputEl = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      inputEl.value = '123.45';

      const event = new KeyboardEvent('keydown', { key: '.', cancelable: true });
      Object.defineProperty(event, 'target', { value: inputEl, enumerable: true });
      const preventSpy = vi.spyOn(event, 'preventDefault');

      component.handleKeyDown(event);
      expect(preventSpy).toHaveBeenCalled();
    });
  });

  describe('Blur Processing Actions', () => {
    it('should enforce default precision boundaries on decimal entries on blur', () => {
      fixture.componentRef.setInput('inputMode', 'decimal');
      fixture.detectChanges();

      const inputEl = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      inputEl.value = '15.5';

      const focusEvent = new FocusEvent('blur');
      Object.defineProperty(focusEvent, 'target', { value: inputEl });

      component.handleBlur(focusEvent);
      expect(component.value()).toBe('15.50');
    });

    it('should respect explicit maxDecimalPlaces constraints when evaluating layouts', () => {
      fixture.componentRef.setInput('inputMode', 'decimal');
      fixture.componentRef.setInput('maxDecimalPlaces', 4);
      fixture.detectChanges();

      const inputEl = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      inputEl.value = '3.141592';

      const focusEvent = new FocusEvent('blur');
      Object.defineProperty(focusEvent, 'target', { value: inputEl });

      component.handleBlur(focusEvent);
      expect(component.value()).toBe('3.1416');
    });
  });
});
