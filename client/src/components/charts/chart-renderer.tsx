/**
 * State-of-the-art Chart Renderer
 * Unified ECharts-based rendering with dark mode support
 */

import { useMemo, useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption, ECharts } from 'echarts';
import { useTheme } from '@/hooks/use-theme';
import { getChartColors } from '@/lib/charts/theme';
import { BarChart3, Loader2 } from 'lucide-react';

// Export handle type for parent components
export interface ChartRendererHandle {
  getChartInstance: () => ECharts | null;
  exportToPNG: (filename?: string) => void;
  getChartDataURL: (pixelRatio?: number) => string | null;
}

// Import all chart configurations
import {
  createInitiativesTimelineConfig,
  createKPIDashboardConfig,
  createRegionalDistributionConfig,
  createSectorImpactConfig,
  createTargetAchievementConfig,
  createCategoriesBreakdownConfig,
  createInvestmentCapacityConfig,
  createSustainabilityGoalsConfig,
} from '@/lib/charts/configs/initiatives';

import {
  createDomainHierarchyConfig,
  createSubDomainDistributionConfig,
  createRoleDistributionConfig,
  createCompanyNetworkConfig,
  createDomainInterconnectionsConfig,
  createJobRoleHierarchyConfig,
  createDomainComplexityConfig,
  createCompaniesByDomainConfig,
} from '@/lib/charts/configs/domains';

import {
  createSalaryRangeByDomainConfig,
  createRoleWiseComparisonConfig,
  createHighestPayingDomainsConfig,
  createSalaryDistributionConfig,
  createDomainSalaryHeatmapConfig,
  createSalaryProgressionConfig,
  createEntryVsMaxGapConfig,
  createSalaryPercentilesConfig,
} from '@/lib/charts/configs/salaries';

import {
  createCertificationPathwayConfig,
  createProviderDistributionConfig,
  createCertsByDomainConfig,
  createCareerProgressionConfig,
  createCertificationROIConfig,
  createRoleCertMatrixConfig,
} from '@/lib/charts/configs/certifications';

import type { Initiative, Domain, Salary, Certification, Company, Role } from '@shared/schema';

interface ChartData {
  initiatives?: Initiative[];
  domains?: (Domain & { subdomainCount?: number; roleCount?: number; companies?: string[] })[];
  salaries?: Salary[];
  certifications?: Certification[];
  companies?: Company[];
  roles?: Role[];
}

interface ChartRendererProps {
  chartId: string;
  chartType: string;
  library?: string;
  dataSource: string;
  data?: ChartData;
  width?: number;
  height?: number;
  isLoading?: boolean;
  showToolbox?: boolean;
  isPreview?: boolean;
}

// Chart ID to config function mapping
const chartConfigMap: Record<string, (data: ChartData, isDark: boolean) => EChartsOption | null> = {
  // Initiatives (1-8)
  '1': (data, isDark) => data.initiatives ? createInitiativesTimelineConfig(data.initiatives, isDark) : null,
  '2': (data, isDark) => data.initiatives ? createKPIDashboardConfig(data.initiatives, isDark) : null,
  '3': (data, isDark) => data.initiatives ? createRegionalDistributionConfig(data.initiatives, isDark) : null,
  '4': (data, isDark) => data.initiatives ? createSectorImpactConfig(data.initiatives, isDark) : null,
  '5': (data, isDark) => data.initiatives ? createTargetAchievementConfig(data.initiatives, isDark) : null,
  '6': (data, isDark) => data.initiatives ? createCategoriesBreakdownConfig(data.initiatives, isDark) : null,
  '7': (data, isDark) => data.initiatives ? createInvestmentCapacityConfig(data.initiatives, isDark) : null,
  '8': (data, isDark) => data.initiatives ? createSustainabilityGoalsConfig(data.initiatives, isDark) : null,
  
  // Domains (9-16)
  '9': (data, isDark) => data.domains ? createDomainHierarchyConfig(data.domains, isDark) : null,
  '10': (data, isDark) => data.domains ? createSubDomainDistributionConfig(data.domains, isDark) : null,
  '11': (data, isDark) => data.domains ? createRoleDistributionConfig(data.domains, isDark) : null,
  '12': (data, isDark) => data.domains && data.companies ? createCompanyNetworkConfig(data.domains, data.companies, isDark) : null,
  '13': (data, isDark) => data.domains ? createDomainInterconnectionsConfig(data.domains, isDark) : null,
  '14': (data, isDark) => data.roles ? createJobRoleHierarchyConfig(data.roles, isDark) : null,
  '15': (data, isDark) => data.domains ? createDomainComplexityConfig(data.domains, isDark) : null,
  '16': (data, isDark) => data.domains ? createCompaniesByDomainConfig(data.domains, isDark) : null,
  
  // Salaries (17-24)
  '17': (data, isDark) => data.salaries && data.domains ? createSalaryRangeByDomainConfig(data.salaries, data.domains, isDark) : null,
  '18': (data, isDark) => data.salaries && data.domains ? createRoleWiseComparisonConfig(data.salaries, data.domains, isDark) : null,
  '19': (data, isDark) => data.salaries && data.domains ? createHighestPayingDomainsConfig(data.salaries, data.domains, isDark) : null,
  '20': (data, isDark) => data.salaries ? createSalaryDistributionConfig(data.salaries, isDark) : null,
  '21': (data, isDark) => data.salaries && data.domains ? createDomainSalaryHeatmapConfig(data.salaries, data.domains, isDark) : null,
  '22': (data, isDark) => data.salaries ? createSalaryProgressionConfig(data.salaries, isDark) : null,
  '23': (data, isDark) => data.salaries && data.domains ? createEntryVsMaxGapConfig(data.salaries, data.domains, isDark) : null,
  '24': (data, isDark) => data.salaries && data.domains ? createSalaryPercentilesConfig(data.salaries, data.domains, isDark) : null,
  
  // Certifications (25-30)
  '25': (data, isDark) => data.certifications && data.roles ? createCertificationPathwayConfig(data.certifications, data.roles, isDark) : null,
  '26': (data, isDark) => data.certifications ? createProviderDistributionConfig(data.certifications, isDark) : null,
  '27': (data, isDark) => data.certifications ? createCertsByDomainConfig(data.certifications, isDark) : null,
  '28': (data, isDark) => data.certifications ? createCareerProgressionConfig(data.certifications, isDark) : null,
  '29': (data, isDark) => data.certifications ? createCertificationROIConfig(data.certifications, isDark) : null,
  '30': (data, isDark) => data.certifications && data.roles ? createRoleCertMatrixConfig(data.certifications, data.roles, isDark) : null,
};

/**
 * Transform chart config for preview mode (thumbnail-friendly)
 */
function applyPreviewMode(option: EChartsOption): EChartsOption {
  return {
    ...option,
    // Disable animations for faster rendering
    animation: false,
    // Remove title
    title: { show: false },
    // Minimize or hide legend
    legend: { show: false },
    // Minimize grid margins
    grid: {
      left: 5,
      right: 5,
      top: 5,
      bottom: 5,
      containLabel: false,
    },
    // Hide axis labels and lines for cleaner preview
    xAxis: Array.isArray(option.xAxis) 
      ? option.xAxis.map((axis: any) => ({
          ...axis,
          axisLabel: { show: false },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          name: '',
        }))
      : option.xAxis ? {
          ...(option.xAxis as any),
          axisLabel: { show: false },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          name: '',
        } : undefined,
    yAxis: Array.isArray(option.yAxis)
      ? option.yAxis.map((axis: any) => ({
          ...axis,
          axisLabel: { show: false },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          name: '',
        }))
      : option.yAxis ? {
          ...(option.yAxis as any),
          axisLabel: { show: false },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          name: '',
        } : undefined,
    // Disable tooltip in preview
    tooltip: { show: false },
    // Hide toolbox
    toolbox: { show: false },
    // Hide data zoom
    dataZoom: undefined,
    // Hide visual map text
    visualMap: option.visualMap ? {
      ...(option.visualMap as any),
      show: false,
    } : undefined,
    // Adjust series for preview
    series: Array.isArray(option.series)
      ? option.series.map((s: any) => ({
          ...s,
          label: { ...s.label, show: false },
          // Adjust specific chart types
          ...(s.type === 'pie' && {
            radius: ['30%', '70%'],
            center: ['50%', '50%'],
            label: { show: false },
            labelLine: { show: false },
          }),
          ...(s.type === 'sunburst' && {
            radius: ['0%', '95%'],
            label: { show: false },
          }),
          ...(s.type === 'treemap' && {
            breadcrumb: { show: false },
            label: { show: false },
          }),
          ...(s.type === 'sankey' && {
            label: { show: false },
            nodeGap: 8,
          }),
          ...(s.type === 'graph' && {
            label: { show: false },
          }),
          ...(s.type === 'tree' && {
            label: { show: false },
          }),
          ...(s.type === 'gauge' && {
            title: { show: false },
            detail: { show: false },
            axisLabel: { show: false },
          }),
          ...(s.type === 'radar' && {
            label: { show: false },
          }),
        }))
      : option.series,
    // Adjust radar axis for preview
    radar: option.radar ? {
      ...(option.radar as any),
      axisName: { show: false },
      axisLabel: { show: false },
    } : undefined,
  };
}

export const ChartRenderer = forwardRef<ChartRendererHandle, ChartRendererProps>(function ChartRenderer({
  chartId,
  chartType,
  library,
  dataSource,
  data,
  height,
  isLoading = false,
  showToolbox = true,
  isPreview = false,
}, ref) {
  const chartRef = useRef<ReactECharts>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  // Get chart colors for current theme
  const colors = getChartColors(isDark);

  // Expose chart instance methods to parent
  useImperativeHandle(ref, () => ({
    getChartInstance: () => {
      if (chartRef.current) {
        return chartRef.current.getEchartsInstance();
      }
      return null;
    },
    exportToPNG: (filename = 'chart') => {
      if (chartRef.current) {
        const instance = chartRef.current.getEchartsInstance();
        if (instance) {
          const url = instance.getDataURL({
            type: 'png',
            pixelRatio: 2,
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
          });
          const link = document.createElement('a');
          link.download = `${filename}.png`;
          link.href = url;
          link.click();
        }
      }
    },
    getChartDataURL: (pixelRatio = 2) => {
      if (chartRef.current) {
        const instance = chartRef.current.getEchartsInstance();
        if (instance) {
          return instance.getDataURL({
            type: 'png',
            pixelRatio,
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
          });
        }
      }
      return null;
    },
  }), [isDark]);
  
  // Handle resize
  const handleResize = useCallback(() => {
    if (chartRef.current) {
      const instance = chartRef.current.getEchartsInstance();
      if (instance) {
        instance.resize();
      }
    }
  }, []);

  // Observe container size changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
        handleResize();
      }
    });

    resizeObserver.observe(container);
    
    // Initial size
    setContainerSize({
      width: container.offsetWidth,
      height: container.offsetHeight,
    });

    return () => resizeObserver.disconnect();
  }, [handleResize]);

  // Also handle window resize
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Trigger resize after render
  useEffect(() => {
    const timer = setTimeout(handleResize, 100);
    return () => clearTimeout(timer);
  }, [handleResize, data, isDark]);
  
  // Generate chart option based on chartId and data
  const chartOption = useMemo(() => {
    if (!data) return null;
    
    const configFn = chartConfigMap[chartId];
    if (!configFn) return null;
    
    let baseOption = configFn(data, isDark);
    if (!baseOption) return null;
    
    // Apply preview mode transformations
    if (isPreview) {
      baseOption = applyPreviewMode(baseOption);
    } else {
      // Add toolbox for full view
      if (showToolbox) {
        baseOption = {
          ...baseOption,
          toolbox: {
            show: true,
            right: 16,
            top: 8,
            feature: {
              saveAsImage: {
                title: 'Save',
                pixelRatio: 2,
              },
              dataZoom: {
                title: {
                  zoom: 'Zoom',
                  back: 'Reset',
                },
              },
              restore: {
                title: 'Reset',
              },
            },
            iconStyle: {
              borderColor: colors.textSecondary,
            },
            emphasis: {
              iconStyle: {
                borderColor: colors.primary[0],
              },
            },
          },
        };
      }
    }
    
    return baseOption;
  }, [chartId, data, isDark, isPreview, showToolbox, colors]);

  // Loading state
  if (isLoading) {
    return (
      <div 
        ref={containerRef}
        className="w-full h-full flex flex-col items-center justify-center"
        style={{ minHeight: height || 400 }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Loading chart data...</p>
      </div>
    );
  }

  // No data state
  if (!chartOption) {
    return (
      <div 
        ref={containerRef}
        className="w-full h-full flex flex-col items-center justify-center"
        style={{ minHeight: height || 400 }}
      >
        <BarChart3 className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground text-sm">No data available</p>
        <p className="text-muted-foreground/60 text-xs mt-1">Chart: {chartType}</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-full"
      style={{ 
        minHeight: isPreview ? height || 180 : height || 500,
        height: isPreview ? (height || 180) : '100%',
      }}
    >
      <ReactECharts
        ref={chartRef}
        option={chartOption}
        style={{ 
          width: '100%', 
          height: '100%',
          minHeight: isPreview ? height || 180 : height || 500,
        }}
        opts={{ 
          renderer: 'canvas',
          devicePixelRatio: window.devicePixelRatio || 2,
        }}
        notMerge={true}
        lazyUpdate={true}
        theme={isDark ? 'dark' : undefined}
      />
    </div>
  );
});

// Export for use in other components
export { chartConfigMap };
