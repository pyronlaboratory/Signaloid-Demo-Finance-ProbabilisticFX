// Partially generated using AI assistance.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { StatsCard } from './stats-card';

describe('StatsCard', () => {
  let component: StatsCard;
  let fixture: ComponentFixture<StatsCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsCard],
    }).compileComponents();

    fixture = TestBed.createComponent(StatsCard);
    component = fixture.componentInstance;
  });

  it('should create the component instance', () => {
    fixture.componentRef.setInput('label', 'Total Revenue');
    fixture.componentRef.setInput('value', '£1,250.00');
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should cleanly render string text values into the template layout elements', () => {
    fixture.componentRef.setInput('label', 'Active Users');
    fixture.componentRef.setInput('value', '1,420');

    fixture.detectChanges();

    const labelEl = fixture.nativeElement.querySelector('.stats-label') as HTMLSpanElement;
    const valueEl = fixture.nativeElement.querySelector('.stats-value') as HTMLSpanElement;

    expect(labelEl.textContent?.trim()).toBe('Active Users');
    expect(valueEl.textContent?.trim()).toBe('1,420');
  });

  it('should handle null inputs gracefully without breaking template bindings', () => {
    fixture.componentRef.setInput('label', null);
    fixture.componentRef.setInput('value', null);

    fixture.detectChanges();

    const labelEl = fixture.nativeElement.querySelector('.stats-label') as HTMLSpanElement;
    const valueEl = fixture.nativeElement.querySelector('.stats-value') as HTMLSpanElement;

    expect(labelEl.textContent?.trim()).toBe('');
    expect(valueEl.textContent?.trim()).toBe('');
  });
});
