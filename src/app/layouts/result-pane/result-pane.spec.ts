// Partially generated using AI assistance.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ResultPane } from './result-pane';
import { SignaloidResult } from '../../services/signaloid';
import { provideHighcharts } from 'highcharts-angular';

describe('ResultPane', () => {
  let component: ResultPane;
  let fixture: ComponentFixture<ResultPane>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultPane],
      providers: [
        provideHighcharts({
          instance: () => import('highcharts').then((m) => m.default || m),
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultPane);
    component = fixture.componentInstance;

    // Set baseline valid initial inputs to prevent initialization template crashes
    fixture.componentRef.setInput('error', null);
    fixture.componentRef.setInput('result', null);
    fixture.componentRef.setInput('ticker', 'EUR');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('stats computation', () => {
    it('should return null if result input is missing or empty', () => {
      expect(component.stats()).toBeNull();
    });

    it('should correctly calculate statistical metrics from distribution samples', () => {
      // Setup a clean array: mean = 10, variance calculation baseline matches loop
      const mockResult: SignaloidResult = {
        mean: 10,
        samples: [8, 9, 10, 11, 12],
        uxString: 'mockUxString',
      };

      fixture.componentRef.setInput('result', mockResult);
      fixture.detectChanges();

      const calculatedStats = component.stats();

      expect(calculatedStats).not.toBeNull();
      expect(calculatedStats?.mean).toBe(10);
      expect(calculatedStats?.min).toBe(8);
      expect(calculatedStats?.max).toBe(12);

      // Expected std deviation for [8, 9, 10, 11, 12] is sqrt(10 / 5) = sqrt(2) ≈ 1.4142
      expect(calculatedStats?.std).toBeCloseTo(1.4142, 4);

      // Confidence interval calculations checking spread limits (10 +/- 1.96 * 1.4142)
      expect(calculatedStats?.ciLower).toBeCloseTo(7.2281, 4);
      expect(calculatedStats?.ciUpper).toBeCloseTo(12.7719, 4);
    });
  });

  describe('refresh output emission', () => {
    it('should emit the refresh output event when trigger button is clicked', () => {
      // Set an error state so the refresh button renders in the DOM
      fixture.componentRef.setInput('error', 'Execution Error Trace');
      fixture.detectChanges();

      const emitSpy = vi.fn();
      component.refresh.subscribe(emitSpy);

      const compiled = fixture.nativeElement as HTMLElement;
      const refreshBtn = compiled.querySelector('app-button');
      refreshBtn?.dispatchEvent(new CustomEvent('btnClick'));
      fixture.detectChanges();

      expect(emitSpy).toHaveBeenCalled();
    });
  });
});
