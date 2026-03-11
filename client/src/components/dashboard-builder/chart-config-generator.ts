/**
 * ECharts Configuration Generator
 * Generates ECharts options from widget configuration and data
 */

import type { EChartsOption } from 'echarts';
import type { DashboardWidget } from './types';
import { COLOR_SCHEMES } from './types';
import { getChartColors } from '@/lib/charts/theme';

interface ChartData {
  labels: string[];
  values: number[];
  series?: { name: string; data: number[] }[];
}

function getColorPalette(schemeId: string, isDark: boolean): string[] {
  const scheme = COLOR_SCHEMES.find(s => s.id === schemeId);
  if (scheme) return scheme.colors;
  
  const themeColors = getChartColors(isDark);
  return themeColors.primary;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function generateChartConfig(
  widget: DashboardWidget,
  data: ChartData,
  isDark: boolean
): EChartsOption {
  const colors = getColorPalette(widget.colorScheme, isDark);
  const themeColors = getChartColors(isDark);
  
  const baseConfig: EChartsOption = {
    animation: true,
    animationDuration: 500,
    backgroundColor: 'transparent',
    textStyle: {
      fontFamily: 'Inter, system-ui, sans-serif',
    },
  };

  // Tooltip base config
  const tooltipConfig = {
    trigger: 'item' as const,
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    borderColor: isDark ? '#374151' : '#E5E7EB',
    borderWidth: 1,
    textStyle: {
      color: themeColors.textPrimary,
      fontSize: 12,
    },
    padding: [8, 12],
  };

  switch (widget.type) {
    case 'bar':
      return {
        ...baseConfig,
        tooltip: { ...tooltipConfig, trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: 60, right: 20, top: 40, bottom: 60, containLabel: true },
        xAxis: {
          type: 'category',
          data: data.labels,
          axisLabel: { 
            color: themeColors.textSecondary, 
            fontSize: 11,
            rotate: data.labels.length > 6 ? 30 : 0,
            interval: 0,
          },
          axisTick: { show: false },
          axisLine: { lineStyle: { color: themeColors.axisLine } },
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: themeColors.textSecondary, fontSize: 11 },
          splitLine: { lineStyle: { color: themeColors.splitLine, type: 'dashed' } },
        },
        series: [{
          type: 'bar',
          data: data.values.map((v, i) => ({
            value: v,
            itemStyle: { 
              color: colors[i % colors.length],
              borderRadius: [4, 4, 0, 0],
            },
          })),
          barMaxWidth: 50,
          label: widget.showLabels ? {
            show: true,
            position: 'top',
            color: themeColors.textSecondary,
            fontSize: 10,
          } : { show: false },
        }],
      };

    case 'line':
      return {
        ...baseConfig,
        tooltip: { ...tooltipConfig, trigger: 'axis' },
        grid: { left: 60, right: 20, top: 40, bottom: 60, containLabel: true },
        xAxis: {
          type: 'category',
          data: data.labels,
          axisLabel: { color: themeColors.textSecondary, fontSize: 11 },
          axisTick: { show: false },
          axisLine: { lineStyle: { color: themeColors.axisLine } },
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: themeColors.textSecondary, fontSize: 11 },
          splitLine: { lineStyle: { color: themeColors.splitLine, type: 'dashed' } },
        },
        series: [{
          type: 'line',
          data: data.values,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { width: 3, color: colors[0] },
          itemStyle: { color: colors[0], borderColor: isDark ? '#1F2937' : '#FFF', borderWidth: 2 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: hexToRgba(colors[0], 0.3) },
                { offset: 1, color: hexToRgba(colors[0], 0.05) },
              ],
            },
          },
        }],
      };

    case 'area':
      return {
        ...baseConfig,
        tooltip: { ...tooltipConfig, trigger: 'axis' },
        grid: { left: 60, right: 20, top: 40, bottom: 60, containLabel: true },
        xAxis: {
          type: 'category',
          data: data.labels,
          boundaryGap: false,
          axisLabel: { color: themeColors.textSecondary, fontSize: 11 },
          axisTick: { show: false },
          axisLine: { lineStyle: { color: themeColors.axisLine } },
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: themeColors.textSecondary, fontSize: 11 },
          splitLine: { lineStyle: { color: themeColors.splitLine, type: 'dashed' } },
        },
        series: [{
          type: 'line',
          data: data.values,
          smooth: true,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: hexToRgba(colors[0], 0.5) },
                { offset: 1, color: hexToRgba(colors[0], 0.1) },
              ],
            },
          },
          lineStyle: { width: 2, color: colors[0] },
          itemStyle: { color: colors[0] },
        }],
      };

    case 'pie':
      return {
        ...baseConfig,
        tooltip: tooltipConfig,
        legend: widget.showLegend ? {
          orient: 'vertical',
          right: 10,
          top: 'center',
          textStyle: { color: themeColors.textSecondary, fontSize: 11 },
        } : { show: false },
        series: [{
          type: 'pie',
          radius: ['0%', '70%'],
          center: widget.showLegend ? ['40%', '50%'] : ['50%', '50%'],
          data: data.labels.map((label, i) => ({
            name: label,
            value: data.values[i],
            itemStyle: { color: colors[i % colors.length] },
          })),
          label: widget.showLabels ? {
            show: true,
            color: themeColors.textSecondary,
            fontSize: 11,
          } : { show: false },
          labelLine: { show: widget.showLabels },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
            },
          },
        }],
      };

    case 'donut':
      return {
        ...baseConfig,
        tooltip: tooltipConfig,
        legend: widget.showLegend ? {
          orient: 'vertical',
          right: 10,
          top: 'center',
          textStyle: { color: themeColors.textSecondary, fontSize: 11 },
        } : { show: false },
        series: [{
          type: 'pie',
          radius: ['45%', '70%'],
          center: widget.showLegend ? ['40%', '50%'] : ['50%', '50%'],
          data: data.labels.map((label, i) => ({
            name: label,
            value: data.values[i],
            itemStyle: { color: colors[i % colors.length] },
          })),
          label: widget.showLabels ? {
            show: true,
            color: themeColors.textSecondary,
            fontSize: 11,
          } : { show: false },
          labelLine: { show: widget.showLabels },
          itemStyle: {
            borderRadius: 6,
            borderColor: isDark ? '#1F2937' : '#FFFFFF',
            borderWidth: 2,
          },
          emphasis: {
            label: { show: true, fontWeight: 'bold' },
          },
        }],
      };

    case 'scatter':
      return {
        ...baseConfig,
        tooltip: tooltipConfig,
        grid: { left: 60, right: 20, top: 40, bottom: 60, containLabel: true },
        xAxis: {
          type: 'value',
          axisLabel: { color: themeColors.textSecondary, fontSize: 11 },
          splitLine: { lineStyle: { color: themeColors.splitLine, type: 'dashed' } },
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: themeColors.textSecondary, fontSize: 11 },
          splitLine: { lineStyle: { color: themeColors.splitLine, type: 'dashed' } },
        },
        series: [{
          type: 'scatter',
          symbolSize: 16,
          data: data.labels.map((_, i) => [i, data.values[i]]),
          itemStyle: { color: colors[0] },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: hexToRgba(colors[0], 0.5),
            },
          },
        }],
      };

    case 'radar':
      const maxValue = Math.max(...(data.series?.flatMap(s => s.data) || data.values)) * 1.2;
      return {
        ...baseConfig,
        tooltip: tooltipConfig,
        legend: widget.showLegend && data.series ? {
          data: data.series.map(s => s.name),
          bottom: 10,
          textStyle: { color: themeColors.textSecondary, fontSize: 11 },
        } : { show: false },
        radar: {
          indicator: data.labels.map(label => ({ name: label, max: maxValue })),
          axisName: { color: themeColors.textSecondary, fontSize: 10 },
          splitLine: { lineStyle: { color: themeColors.splitLine } },
          splitArea: { show: true, areaStyle: { color: isDark ? ['#1F2937', '#111827'] : ['#F9FAFB', '#F3F4F6'] } },
        },
        series: [{
          type: 'radar',
          data: data.series ? data.series.map((s, i) => ({
            name: s.name,
            value: s.data,
            areaStyle: { color: hexToRgba(colors[i % colors.length], 0.2) },
            lineStyle: { color: colors[i % colors.length], width: 2 },
            itemStyle: { color: colors[i % colors.length] },
          })) : [{
            value: data.values,
            areaStyle: { color: hexToRgba(colors[0], 0.3) },
            lineStyle: { color: colors[0], width: 2 },
          }],
        }],
      };

    case 'treemap':
      return {
        ...baseConfig,
        tooltip: tooltipConfig,
        series: [{
          type: 'treemap',
          data: data.labels.map((label, i) => ({
            name: label,
            value: data.values[i],
            itemStyle: { color: colors[i % colors.length] },
          })),
          label: {
            show: true,
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: 500,
          },
          breadcrumb: { show: false },
          itemStyle: {
            borderColor: isDark ? '#1F2937' : '#FFFFFF',
            borderWidth: 2,
            gapWidth: 2,
          },
          levels: [{
            itemStyle: { borderRadius: 6 },
          }],
        }],
      };

    case 'funnel':
      return {
        ...baseConfig,
        tooltip: tooltipConfig,
        legend: widget.showLegend ? {
          orient: 'vertical',
          right: 10,
          top: 'center',
          textStyle: { color: themeColors.textSecondary, fontSize: 11 },
        } : { show: false },
        series: [{
          type: 'funnel',
          left: widget.showLegend ? '10%' : '15%',
          right: widget.showLegend ? '30%' : '15%',
          top: 20,
          bottom: 20,
          minSize: '20%',
          maxSize: '100%',
          sort: 'descending',
          gap: 4,
          label: {
            show: true,
            position: 'inside',
            color: '#FFFFFF',
            fontSize: 11,
          },
          data: data.labels.map((label, i) => ({
            name: label,
            value: data.values[i],
            itemStyle: { color: colors[i % colors.length] },
          })).sort((a, b) => b.value - a.value),
        }],
      };

    case 'gauge':
      const gaugeValue = data.values[0] || 0;
      const gaugeMax = Math.ceil(gaugeValue * 1.5 / 100) * 100 || 100;
      return {
        ...baseConfig,
        series: [{
          type: 'gauge',
          radius: '85%',
          startAngle: 200,
          endAngle: -20,
          min: 0,
          max: gaugeMax,
          splitNumber: 5,
          itemStyle: { color: colors[0] },
          progress: {
            show: true,
            width: 20,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 1, y2: 0,
                colorStops: [
                  { offset: 0, color: colors[0] },
                  { offset: 1, color: colors[1] || colors[0] },
                ],
              },
            },
          },
          pointer: { show: false },
          axisLine: {
            lineStyle: {
              width: 20,
              color: [[1, isDark ? '#374151' : '#E5E7EB']],
            },
          },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: {
            distance: 30,
            color: themeColors.textSecondary,
            fontSize: 10,
          },
          title: {
            show: true,
            offsetCenter: [0, '70%'],
            color: themeColors.textSecondary,
            fontSize: 12,
          },
          detail: {
            valueAnimation: true,
            offsetCenter: [0, '30%'],
            fontSize: 28,
            fontWeight: 700,
            color: themeColors.textPrimary,
            formatter: (value: number) => value.toLocaleString(),
          },
          data: [{ value: gaugeValue, name: widget.yAxis?.label || 'Value' }],
        }],
      };

    case 'heatmap':
      // For heatmap, we need 2D data - simplify to grid
      const heatmapData: [number, number, number][] = [];
      const xLen = Math.min(data.labels.length, 10);
      const yLen = Math.ceil(data.values.length / xLen);
      
      for (let i = 0; i < data.values.length; i++) {
        heatmapData.push([i % xLen, Math.floor(i / xLen), data.values[i]]);
      }
      
      const heatmapMax = Math.max(...data.values);
      
      return {
        ...baseConfig,
        tooltip: {
          ...tooltipConfig,
          formatter: (params: any) => `${params.value[2].toLocaleString()}`,
        },
        grid: { left: 60, right: 80, top: 20, bottom: 60 },
        xAxis: {
          type: 'category',
          data: data.labels.slice(0, xLen),
          axisLabel: { color: themeColors.textSecondary, fontSize: 10, rotate: 30 },
          axisTick: { show: false },
          axisLine: { show: false },
        },
        yAxis: {
          type: 'category',
          data: Array.from({ length: yLen }, (_, i) => `Row ${i + 1}`),
          axisLabel: { color: themeColors.textSecondary, fontSize: 10 },
          axisTick: { show: false },
          axisLine: { show: false },
        },
        visualMap: {
          min: 0,
          max: heatmapMax,
          calculable: true,
          orient: 'vertical',
          right: 10,
          top: 'center',
          inRange: {
            color: isDark 
              ? ['#1E3A5F', colors[0], colors[1] || colors[0]]
              : ['#EFF6FF', colors[0], colors[1] || colors[0]],
          },
          textStyle: { color: themeColors.textSecondary, fontSize: 10 },
        },
        series: [{
          type: 'heatmap',
          data: heatmapData,
          label: { show: false },
          emphasis: {
            itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.3)' },
          },
        }],
      };

    case 'boxplot':
      // Simplified boxplot - show as bar with error bars
      return {
        ...baseConfig,
        tooltip: { ...tooltipConfig, trigger: 'axis' },
        grid: { left: 60, right: 20, top: 40, bottom: 60, containLabel: true },
        xAxis: {
          type: 'category',
          data: data.labels,
          axisLabel: { color: themeColors.textSecondary, fontSize: 11, rotate: 30 },
          axisTick: { show: false },
          axisLine: { lineStyle: { color: themeColors.axisLine } },
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: themeColors.textSecondary, fontSize: 11 },
          splitLine: { lineStyle: { color: themeColors.splitLine, type: 'dashed' } },
        },
        series: [{
          type: 'bar',
          data: data.values.map((v, i) => ({
            value: v,
            itemStyle: { 
              color: hexToRgba(colors[i % colors.length], 0.6),
              borderColor: colors[i % colors.length],
              borderWidth: 2,
              borderRadius: [4, 4, 0, 0],
            },
          })),
          barMaxWidth: 40,
        }],
      };

    default:
      return baseConfig;
  }
}
