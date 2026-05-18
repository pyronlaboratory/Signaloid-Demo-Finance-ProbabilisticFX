import { Component, computed, HostListener, inject, input, output, signal } from '@angular/core';
import { SignaloidResult } from '../../services/signaloid';
import { CommandMenu } from '../../components/command-menu/command-menu';
import { HighchartsChartDirective, providePartialHighcharts } from 'highcharts-angular';
import {
  buildHistogramOptions,
  buildBellCurveOptions,
  ChartFlags,
  ChartStats,
} from '../../utils/charts.config';
import { ChartThemeService } from '../../services/chart-theme';
import type * as HighchartsNamespace from 'highcharts';
import type { Chart, Options } from 'highcharts';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { cssMenuRightAlt, cssSoftwareDownload } from '@ng-icons/css.gg';

export type ExportStatus = 'success' | 'error';

declare module 'highcharts' {
  interface SVGRenderer {
    forExport?: boolean;
  }

  interface Chart {
    exportChart(exportOptions: ExportingOptions, chartOptions: Options): void;
  }
}

/**
 * Container component that that manages the state, layout, and configuration mappings for
 * Highcharts data visualizations. It dynamically derives chart configurations from a global
 * theme service, reacts to toggleable visibility flags, and coordinates client-side image
 * exports.
 */
@Component({
  selector: 'app-result-charts',
  imports: [NgIcon, HighchartsChartDirective, CommandMenu],
  providers: [
    provideIcons({ cssMenuRightAlt, cssSoftwareDownload }),
    providePartialHighcharts({
      modules: () => [
        import('highcharts/esm/modules/histogram-bellcurve'),
        import('highcharts/esm/modules/accessibility'),
        import('highcharts/esm/modules/exporting'),
        import('highcharts/esm/modules/offline-exporting'),
        import('highcharts/esm/highcharts-more'),
      ],
    }),
  ],
  templateUrl: './result-charts.html',
  styleUrl: './result-charts.scss',
})
export class ResultCharts {
  Highcharts = signal<typeof HighchartsNamespace | null>(null);
  private activeChartInstance: Chart | null = null;
  private themeService = inject(ChartThemeService);
  private theme = this.themeService.theme;

  private flags = computed<ChartFlags>(() => ({
    showCI: this.showCI(),
    showMean: this.showMean(),
    showScatter: this.showScatter(),
    showLegend: this.showLegend(),
  }));

  result = input.required<SignaloidResult>();
  ticker = input.required<string>();
  stats = input.required<ChartStats>();
  exportStatus = output<ExportStatus>();

  activeTab = signal<'histogram' | 'bellcurve'>('histogram');
  menuOpen = signal(false);
  graphOptions = signal([
    { key: 'legend', label: 'Legend', value: true },
    { key: 'ci', label: 'Confidence Interval Overlap', value: false },
    { key: 'mean', label: 'Mean', value: false },
    { key: 'scatter', label: 'Scatter points', value: true },
  ]);

  showLegend = computed(() => this.graphOptions().find((o) => o.key === 'legend')?.value ?? true);
  showCI = computed(() => this.graphOptions().find((o) => o.key === 'ci')?.value ?? true);
  showMean = computed(() => this.graphOptions().find((o) => o.key === 'mean')?.value ?? true);
  showScatter = computed(
    () => this.graphOptions().find((o) => o.key === 'scatter')?.value ?? false,
  );

  histogramOptions = computed<Options>(() => {
    const options = buildHistogramOptions(
      this.result()?.samples ?? [],
      this.theme(),
      this.flags(),
      this.stats(),
      this.ticker(),
    );
    return options;
  });

  bellCurveOptions = computed<Options>(() => {
    const options = buildBellCurveOptions(
      this.result()?.samples ?? [],
      this.theme(),
      this.flags(),
      this.stats(),
      this.ticker(),
    );
    return options;
  });

  setTab(tab: 'histogram' | 'bellcurve'): void {
    this.activeChartInstance = null;
    this.activeTab.set(tab);
  }

  toggleMenu(e: MouseEvent): void {
    e.stopPropagation();
    this.menuOpen.update((v) => !v);
  }

  toggleOption(key: string): void {
    this.graphOptions.update((opts) =>
      opts.map((o) => (o.key === key ? { ...o, value: !o.value } : o)),
    );
  }

  onChartInstance(chart: Chart) {
    // Highcharts sets 'forExport' to true on temporary instances created during exporting.
    // We only want to capture the primary chart instance.
    if (chart.renderer && chart.renderer.forExport) {
      return;
    }

    this.activeChartInstance = chart;
  }

  exportChart(): void {
    const chart = this.activeChartInstance;
    if (!chart || !chart?.series?.length) {
      this.exportStatus.emit('error');
      this.menuOpen.set(false);
      return;
    }

    try {
      const currentOptions =
        this.activeTab() === 'histogram' ? this.histogramOptions() : this.bellCurveOptions();

      chart?.exportChart(
        {
          type: 'image/png',
          filename: `signaloid-${this.activeTab()}-${Date.now()}`,
        },
        {
          chart: {
            backgroundColor: '#FFFFFF',
          },
          xAxis: currentOptions.xAxis,
          yAxis: currentOptions.yAxis,
          series: currentOptions.series,
          legend: currentOptions.legend,
          title: {
            text: currentOptions.title?.text,
            style: { display: 'block', color: '#333333' },
          },
        },
      );
      this.exportStatus.emit('success');
    } catch (error) {
      this.exportStatus.emit('error');
    }

    this.menuOpen.set(false);
  }

  @HostListener('document:click')
  closeMenu(): void {
    this.menuOpen.set(false);
  }

  ngOnDestroy(): void {
    this.activeChartInstance = null;
  }
}
