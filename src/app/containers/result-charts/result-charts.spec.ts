// Partially generated using AI assistance.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ResultCharts } from './result-charts';
import { ChartThemeService } from '../../services/chart-theme';
import { SignaloidResult } from '../../services/signaloid';
import { ChartTheme, ChartStats } from '../../utils/charts.config';
import { provideHighcharts } from 'highcharts-angular';

describe('ResultCharts', () => {
  let component: ResultCharts;
  let fixture: ComponentFixture<ResultCharts>;
  let mockThemeService: Record<string, any>;

  const mockResult: Partial<SignaloidResult> = {
    samples: [1.05, 1.1, 1.15, 1.2],
  };

  const mockStats: ChartStats = {
    mean: 1.125,
    min: 1.05,
    max: 1.2,
    std: 0.05,
    ciLower: 1.07,
    ciUpper: 1.18,
  };

  const dummyTheme: ChartTheme = {
    primary: '#000000',
    accent: '#ffffff',
    divider: '#eeeeee',
    textPrimary: '#111111',
    textAccent: '#222222',
    textSecondary: '#333333',
    textMuted: '#444444',
    plotLines: '#555555',
  };

  beforeEach(async () => {
    mockThemeService = {
      theme: signal(dummyTheme).asReadonly(),
    };

    await TestBed.configureTestingModule({
      imports: [ResultCharts],
      providers: [
        { provide: ChartThemeService, useValue: mockThemeService },
        provideHighcharts({
          instance: () => import('highcharts').then((m) => m.default || m),
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultCharts);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('result', mockResult);
    fixture.componentRef.setInput('ticker', 'GBP');
    fixture.componentRef.setInput('stats', mockStats);
  });

  it('should create and consume configurations from the injected theme service', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();

    const activeTheme = component['themeService'].theme();
    expect(activeTheme).toEqual(dummyTheme);
  });

  describe('Accessibility & Core Structure Layouts', () => {
    it('should present a semantic tablist container and default to the histogram view', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;

      const tablist = compiled.querySelector('[role="tablist"]');
      const tabs = compiled.querySelectorAll('[role="tab"]');

      expect(tablist).toBeTruthy();
      expect(tablist?.getAttribute('aria-label')).toBe('Chart Views');
      expect(tabs.length).toBe(2);
      expect(tabs[0].getAttribute('aria-selected')).toBe('true');
      expect(tabs[1].getAttribute('aria-selected')).toBe('false');
    });

    it('should anchor charts inside a region landmark output container', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;

      const region = compiled.querySelector('[role="region"]');
      expect(region).toBeTruthy();
      expect(region?.getAttribute('aria-label')).toBe('Data Visualization');
    });
  });

  describe('Tab View Navigation States', () => {
    it('should pivot view states cleanly and purge active canvas references', () => {
      fixture.detectChanges();
      component['activeChartInstance'] = { id: 'previous_canvas' } as any;
      component.setTab('bellcurve');

      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const tabs = compiled.querySelectorAll('[role="tab"]');

      expect(component.activeTab()).toBe('bellcurve');
      expect(component['activeChartInstance']).toBeNull();
      expect(tabs[0].getAttribute('aria-selected')).toBe('false');
      expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    });
  });

  describe('Interaction Overlays and Side Options', () => {
    it('should announce appropriate menu popovers on the configuration triggers', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const menuBtn = compiled.querySelector('.menu-toggle');

      expect(menuBtn?.getAttribute('aria-haspopup')).toBe('menu');
      expect(menuBtn?.getAttribute('aria-expanded')).toBe('false');

      component.toggleMenu(new MouseEvent('click'));
      fixture.detectChanges();
      expect(menuBtn?.getAttribute('aria-expanded')).toBe('true');
    });

    it('should collapse the option menu when a global background document click triggers', () => {
      fixture.detectChanges();
      component.menuOpen.set(true);

      component.closeMenu();
      fixture.detectChanges();

      expect(component.menuOpen()).toBe(false);
    });
  });

  describe('Export Execution Routines', () => {
    it('should trigger the internal exporting routine and report success under optimal state', () => {
      fixture.detectChanges();
      const statusSpy = vi.spyOn(component.exportStatus, 'emit');
      const mockExportSpy = vi.fn();

      const mockChartInstance = {
        series: [{ data: [1, 2, 3] }],
        exportChart: mockExportSpy,
      };

      component['activeChartInstance'] = mockChartInstance as any;
      component.exportChart();

      expect(mockExportSpy).toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith('success');
      expect(component.menuOpen()).toBe(false);
    });

    it('should gracefully bubble error exceptions if internal dependencies are unpopulated', () => {
      fixture.detectChanges();
      const statusSpy = vi.spyOn(component.exportStatus, 'emit');

      component['activeChartInstance'] = null;
      component.exportChart();

      expect(statusSpy).toHaveBeenCalledWith('error');
      expect(component.menuOpen()).toBe(false);
    });
  });
});
