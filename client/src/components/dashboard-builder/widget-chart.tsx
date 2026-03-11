/**
 * Widget Chart Component
 * Renders an individual chart widget with ECharts
 */

import { useMemo, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import ReactECharts from 'echarts-for-react';
import { Loader2, AlertCircle, BarChart3, Settings2, ArrowRight, Hash } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { useWidgetData } from './use-dashboard-data';
import { generateChartConfig } from './chart-config-generator';
import { validateChartConfig } from './types';
import type { DashboardWidget } from './types';

interface WidgetChartProps {
  widget: DashboardWidget;
  width?: number;
  height?: number;
}

export interface WidgetChartRef {
  getDataURL: () => string | null;
  getEchartsInstance: () => any;
}

export const WidgetChart = forwardRef<WidgetChartRef, WidgetChartProps>(
  function WidgetChart({ widget, width, height }, ref) {
  const chartRef = useRef<ReactECharts>(null);
  const { isDark } = useTheme();
  const { data, isLoading } = useWidgetData(widget);

  // Validate chart configuration
  const validation = useMemo(() => validateChartConfig(widget), [widget]);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    getDataURL: () => {
      if (chartRef.current) {
        const instance = chartRef.current.getEchartsInstance();
        if (instance) {
          return instance.getDataURL({
            type: 'png',
            pixelRatio: 2,
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
          });
        }
      }
      return null;
    },
    getEchartsInstance: () => chartRef.current?.getEchartsInstance(),
  }));

  // Resize chart when container size changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (chartRef.current) {
        chartRef.current.getEchartsInstance()?.resize();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [width, height]);

  // Generate chart configuration
  const chartOption = useMemo(() => {
    if (!validation.isValid || !data || data.labels.length === 0) return null;
    return generateChartConfig(widget, data, isDark);
  }, [widget, data, isDark, validation.isValid]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show validation error with helpful message
  if (!validation.isValid) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
        <div className="rounded-full bg-amber-500/10 p-3 mb-3">
          <Settings2 className="h-6 w-6 text-amber-500" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">
          {validation.message}
        </p>
        <p className="text-xs text-muted-foreground max-w-[200px]">
          {validation.suggestion}
        </p>
        {validation.errorType === 'missing_both' && (
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground/70">
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-muted">
              <ArrowRight className="h-3 w-3" />
              <span>X-Axis</span>
            </div>
            <span>+</span>
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-muted">
              <Hash className="h-3 w-3" />
              <span>Y-Axis</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!data || data.labels.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
        <div className="rounded-full bg-muted p-3 mb-3">
          <AlertCircle className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">No data available</p>
        <p className="text-xs text-muted-foreground">
          The selected data source has no records
        </p>
      </div>
    );
  }

  if (!chartOption) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
        <div className="rounded-full bg-muted p-3 mb-3">
          <BarChart3 className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">Unable to render chart</p>
        <p className="text-xs text-muted-foreground">
          Try adjusting the data binding configuration
        </p>
      </div>
    );
  }

  return (
    <ReactECharts
      ref={chartRef}
      option={chartOption}
      style={{ width: '100%', height: '100%' }}
      opts={{ renderer: 'canvas' }}
      notMerge={true}
      lazyUpdate={true}
    />
  );
});
