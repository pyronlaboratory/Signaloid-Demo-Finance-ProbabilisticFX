// Partially generated using AI assistance.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideIcons } from '@ng-icons/core';
import { cssCheckO, cssInfo } from '@ng-icons/css.gg';
import { Toast } from './toast';

describe('Toast Component', () => {
  let component: Toast;
  let fixture: ComponentFixture<Toast>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Toast],
      providers: [provideIcons({ cssCheckO, cssInfo })],
    }).compileComponents();

    fixture = TestBed.createComponent(Toast);
    component = fixture.componentInstance;
  });

  it('should compile with the registered icon providers', () => {
    fixture.componentRef.setInput('message', { text: 'Success!', type: 'success' });
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should dismiss and emit closed output when close button is clicked', () => {
    fixture.componentRef.setInput('message', { text: 'Test', type: 'success' });
    fixture.detectChanges();

    const closedSpy = vi.spyOn(component.closed, 'emit');
    const closeBtn = fixture.nativeElement.querySelector('.close') as HTMLButtonElement;

    closeBtn.click();
    fixture.detectChanges();

    expect(component.visible()).toBe(false);
    expect(closedSpy).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.toast')).toBeNull();
  });
});
