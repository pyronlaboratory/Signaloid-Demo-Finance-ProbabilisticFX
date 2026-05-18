// Partially generated using AI assistance.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach } from 'vitest';

import { ResultSummary } from './result-summary';
import { ChartStats } from '../../utils/charts.config';

describe('ResultSummary', () => {
  let component: ResultSummary;
  let fixture: ComponentFixture<ResultSummary>;

  const mockStats: Partial<ChartStats> = {
    mean: 1.05432,
    min: 0.98,
    max: 1.23499,
    std: 0.04111,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultSummary],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultSummary);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('stats', mockStats);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Data Rendering and Transformation Profiles', () => {
    it('should stay hidden structurally if the input signal remains unpopulated', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const gridContainer = compiled.querySelector('.stats-grid');

      expect(gridContainer).toBeNull();
    });

    it('should format statistical numeric strings via DecimalPipe layout rules', () => {
      fixture.componentRef.setInput('stats', mockStats);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const gridContainer = compiled.querySelector('.stats-grid');
      expect(gridContainer).toBeTruthy();

      const cards = fixture.debugElement.queryAll(By.css('app-stats-card'));
      expect(cards[0].componentInstance.value()).toBe('1.05');
      expect(cards[1].componentInstance.value()).toBe('0.98');
      expect(cards[2].componentInstance.value()).toBe('1.23');
      expect(cards[3].componentInstance.value()).toBe('0.04');
    });
  });
});
