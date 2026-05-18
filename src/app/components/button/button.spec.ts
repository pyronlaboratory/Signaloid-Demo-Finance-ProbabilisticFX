// Partially generated using AI assistance.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  let component: Button;
  let fixture: ComponentFixture<Button>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Button],
    }).compileComponents();

    fixture = TestBed.createComponent(Button);
    component = fixture.componentInstance;
  });

  it('should compile and initialize with core defaults', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Style Classes and Variants', () => {
    it('should assign correct variant classes without overwriting host classes', () => {
      fixture.componentRef.setInput('variant', 'danger');
      fixture.detectChanges();

      const buttonEl = fixture.nativeElement.querySelector('button');
      expect(buttonEl.classList.contains('btn-danger')).toBe(true);
      expect(buttonEl.classList.contains('btn-primary')).toBe(false);
    });
  });

  describe('Interaction and State Guards', () => {
    it('should emit the click output signal when clicked in a normal state', () => {
      fixture.detectChanges();
      const clickSpy = vi.spyOn(component.btnClick, 'emit');

      const buttonEl = fixture.nativeElement.querySelector('button');
      buttonEl.click();

      expect(clickSpy).toHaveBeenCalled();
    });

    it('should suppress click events and set appropriate ARIA attributes when loading', () => {
      fixture.componentRef.setInput('isLoading', true);
      fixture.detectChanges();

      const clickSpy = vi.spyOn(component.btnClick, 'emit');
      const buttonEl = fixture.nativeElement.querySelector('button');

      buttonEl.click();

      expect(clickSpy).not.toHaveBeenCalled();
      expect(buttonEl.getAttribute('aria-busy')).toBe('true');
      expect(buttonEl.disabled).toBe(true);
    });

    it('should suppress click events when explicitly disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const clickSpy = vi.spyOn(component.btnClick, 'emit');
      const buttonEl = fixture.nativeElement.querySelector('button');

      buttonEl.click();

      expect(clickSpy).not.toHaveBeenCalled();
      expect(buttonEl.disabled).toBe(true);
    });
  });
});
