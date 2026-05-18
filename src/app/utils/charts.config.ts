import type {
  Chart,
  LegendOptions,
  Options,
  PlotBellcurveOptions,
  SeriesBellcurveOptions,
  SeriesOptionsType,
  SeriesZonesOptionsObject,
  XAxisPlotBandsOptions,
  XAxisPlotLinesOptions,
} from 'highcharts';

export interface ChartTheme {
  primary: string;
  accent: string;
  divider: string;
  textPrimary: string;
  textAccent: string;
  textSecondary: string;
  textMuted: string;
  plotLines: string;
}

export interface ChartFlags {
  showCI: boolean;
  showMean: boolean;
  showScatter: boolean;
  showLegend: boolean;
}

export interface ChartStats {
  mean: number;
  min: number;
  max: number;
  std: number;
  ciLower: number;
  ciUpper: number;
}

export const SHARED_LEGEND: LegendOptions = {
  enabled: true,
  align: 'center',
  verticalAlign: 'bottom',
  layout: 'horizontal',
  itemStyle: {
    color: 'var(--text-primary)',
    fontSize: '13px',
    fontWeight: '500',
  },
  itemHoverStyle: {
    color: 'var(--text-accent)',
  },
  borderWidth: 0,
  backgroundColor: 'transparent',
  symbolRadius: 3,
  events: {
    itemClick: () => false,
  },
};

function buildCIPlotBand(stats: ChartStats | null, theme: ChartTheme): XAxisPlotBandsOptions[] {
  if (!stats) return [];
  return [
    {
      from: stats.ciLower,
      to: stats.ciUpper,
      color: `${theme.accent}1a`,
      label: {
        text: 'µ ± 1.96σ',
        align: 'left',
        style: {
          color: theme.textPrimary,
          fontSize: '12px',
          fontWeight: '500',
          transform: 'translate(16px, 10px)',
        },
        y: 15,
      },
      zIndex: 0,
    },
  ];
}

function buildMeanPlotLine(stats: ChartStats | null, theme: ChartTheme): XAxisPlotLinesOptions[] {
  if (!stats) return [];
  return [
    {
      value: stats.mean,
      color: theme.plotLines,
      width: 2,
      dashStyle: 'Dash',
      zIndex: 5,
      label: {
        text: `Mean: ${stats.mean.toFixed(2)}`,
        rotation: 0,
        align: 'center',
        textAlign: 'center',
        y: -15,
        style: {
          color: theme.primary,
          fontWeight: 'bold',
          fontSize: '12px',
        },
      },
    },
  ];
}

/**
 * Configuration and logic adapted from the Highcharts Histogram demo.
 * @see https://www.highcharts.com/demo/highcharts/histogram
 */
export function buildHistogramOptions(
  data: number[],
  theme: ChartTheme,
  flags: ChartFlags,
  stats: ChartStats | null,
  ticker: string,
): Options {
  return {
    title: {
      text: 'Distribution Histogram',
      align: 'center',
      margin: 48,
      style: {
        color: theme.textPrimary,
        fontSize: '18px',
        fontWeight: '600',
        display: 'none',
      },
    },
    xAxis: [
      {
        title: { text: `Converted Amount (${ticker})` },
        plotBands: flags.showCI ? buildCIPlotBand(stats, theme) : [],
        plotLines: flags.showMean ? buildMeanPlotLine(stats, theme) : [],
        minPadding: 0.05,
        maxPadding: 0.05,
      },
    ],
    yAxis: [
      { title: { text: 'Frequency' } },
      {
        visible: false,
        min: -1,
        max: 1,
        startOnTick: false,
        endOnTick: false,
        tickPositions: [-1, 0, 1],
      },
    ],
    accessibility: {
      enabled: true,
      description: 'Histogram showing the distribution of 1000 currency conversion samples.',
      point: {
        valueDescriptionFormat:
          'Bucket from {point.x:.3f} to {point.x2:.3f} contains {point.y} samples.',
      },
      keyboardNavigation: { enabled: true },
      screenReaderSection: {
        beforeChartFormat: `<h5>{chartTitle}</h5>
          <div>{typeDescription}</div>
          <div>{chartSubtitle}</div>
          <div>{chartLongDesc}</div>`,
      },
    },
    plotOptions: {
      scatter: {
        accessibility: { enabled: false },
      },
      histogram: {
        // binsNumber: Math.round(Math.sqrt(data.length)), // Square root rule --for comparison
        binsNumber: Math.ceil(Math.log2(data.length) + 1), // Sturges' Rule
        color: 'color-mix(in srgb, var(--primary), white 1%)',
        borderColor: 'var(--primary)',
        borderWidth: 1,
      },
    },
    legend: {
      ...SHARED_LEGEND,
      enabled: flags.showLegend,
    },
    series: [
      {
        name: 'Sample Frequency',
        type: 'histogram',
        // `SeriesOptionsType` is a broad union of all series types across Highcharts
        // products, so TypeScript cannot verify `data: number[]` compatibility.

        // The intermediate `unknown` cast is intentional since histogram accepts
        // raw one-dimensional data directly at runtime, even though the type
        // definitions don't reflect this.

        // Ref:
        // https://api.highcharts.com/highcharts/series.histogram
        // https://api.highcharts.com/class-reference/Highcharts#.SeriesOptionsType
        data: data as unknown as SeriesBellcurveOptions['data'],
        zIndex: 1,
        opacity: 0.9,
        visible: true,
      },
      {
        name: 'Simulation Outcomes (n=1000)',
        type: 'scatter',
        data: data.map((x) => [x, 0]),
        yAxis: 1,
        marker: { radius: 1.5 },
        jitter: { y: 1 },
        opacity: 0.5,
        enableMouseTracking: false,
        visible: flags.showScatter,
        showInLegend: flags.showScatter,
      },
    ],
    credits: { enabled: false },
    exporting: { enabled: false },
  };
}

/**
 * Configuration and logic adapted from the Highcharts Bellcurve demo.
 * @see https://www.highcharts.com/demo/highcharts/bellcurve
 */
export function buildBellCurveOptions(
  data: number[],
  theme: ChartTheme,
  flags: ChartFlags,
  stats: ChartStats | null,
  ticker: string,
): Options {
  return {
    chart: {
      events: {
        render: function (this: Chart) {
          const chart = this;
          const series = chart.series[0];
          const isDecorated = (series?.options as any)?.custom?.decorated;

          if (series && series.points.length > 0 && !isDecorated) {
            const bellOptions = series.options as PlotBellcurveOptions;
            const pointsInInterval = bellOptions.pointsInInterval || 45;

            const labels = ['3σ', '2σ', 'σ', 'μ', 'σ', '2σ', '3σ'];
            const opacities = [0.1, 0.2, 0.6, 1, 1, 0.6, 0.2, 0.1];

            const zones: SeriesZonesOptionsObject[] = series.points
              .filter((_, i) => i % pointsInInterval === 0)
              .map((point, i) => ({
                value: point.x,
                fillColor:
                  i < opacities.length
                    ? `${theme.primary}${Math.floor(opacities[i] * 255)
                        .toString(16)
                        .padStart(2, '0')}`
                    : theme.primary,
              }));

            series.update(
              {
                zoneAxis: 'x',
                zones,
                color: theme.primary,
                custom: { decorated: true },
              } as any,
              false,
            );

            series.points
              .filter((_, i) => i % pointsInInterval === 0)
              .forEach((point, i) => {
                point.update(
                  {
                    dataLabels: {
                      enabled: true,
                      format: labels[i],
                      y: -5,
                      style: {
                        fontSize: '12px',
                        fontWeight: '600',
                        color: theme.textSecondary,
                      },
                    },
                  },
                  false,
                );
              });

            chart.redraw();
          }
        },
      },
    },
    title: {
      text: 'Probability Density Curve',
      align: 'center',
      margin: 48,
      style: {
        color: theme.textPrimary,
        fontSize: '18px',
        fontWeight: '600',
        display: 'none',
      },
    },
    xAxis: [
      {
        title: {
          text: `Estimated Value (${ticker})`,
          style: { color: theme.textSecondary },
        },
        labels: { style: { color: theme.textSecondary } },
        plotBands: flags.showCI ? buildCIPlotBand(stats, theme) : [],
        plotLines: flags.showMean ? buildMeanPlotLine(stats, theme) : [],
      },
    ],
    yAxis: [
      {
        title: { text: 'Probability density', style: { color: theme.textSecondary } },
        labels: { style: { color: theme.textSecondary } },
      },
      {
        visible: false,
        min: -1,
        max: 1,
        startOnTick: false,
        endOnTick: false,
        tickPositions: [-1, 0, 1],
      },
    ],
    accessibility: {
      enabled: true,
      description: `Probability density curve showing the estimated conversion value.`,
      point: {
        valueDescriptionFormat: 'At value {point.x:.3f}, the probability density is {point.y:.5f}.',
      },
      keyboardNavigation: { enabled: true },
      screenReaderSection: {
        beforeChartFormat: `<h5>{chartTitle}</h5>
          <div>{typeDescription}</div>
          <div>{chartSubtitle}</div>
          <div>{chartLongDesc}</div>`,
      },
    },
    plotOptions: {
      scatter: {
        accessibility: { enabled: false },
      },
    },
    legend: {
      ...SHARED_LEGEND,
      enabled: flags.showLegend,
    },
    series: [
      {
        name: 'Estimated Distribution',
        type: 'bellcurve',
        data,
        zIndex: -1,
        pointsInInterval: 45,
        enableMouseTracking: true,
        stickyTracking: false,
        marker: { enabled: false },
        events: {
          legendItemClick: () => false,
        },
        // `SeriesOptionsType` is a broad union of all series types across Highcharts
        // products, so TypeScript cannot verify `data: number[]` compatibility.

        // The intermediate `unknown` cast is intentional since bellcurve accepts
        // raw one-dimensional data directly at runtime, even though the type
        // definitions don't reflect this.

        // Ref:
        // https://api.highcharts.com/highcharts/series.bellcurve
        // https://api.highcharts.com/class-reference/Highcharts#.SeriesOptionsType
      } as unknown as SeriesOptionsType,
      {
        name: 'Simulation Outcomes (n=1000)',
        type: 'scatter',
        data: data.map((x) => [x, 0]),
        yAxis: 1,
        marker: {
          radius: 1.5,
          fillColor: theme.textAccent,
        },
        jitter: { y: 1 },
        opacity: 0.5,
        enableMouseTracking: false,
        visible: flags.showScatter,
        showInLegend: flags.showScatter,
        events: {
          legendItemClick: () => false,
        },
      },
    ],

    credits: { enabled: false },
    exporting: { enabled: false },
  };
}
