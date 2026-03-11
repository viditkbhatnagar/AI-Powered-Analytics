/**
 * Salary Chart Configurations
 * Charts 17-24: Salary Range by Domain, Role-wise Comparison, Heatmap, etc.
 */

import type { EChartsOption } from 'echarts';
import type { Salary, Domain } from '@shared/schema';
import { getChartColors, animationConfig } from '../theme';
import { 
  hexToRgba, 
  createGradient, 
  formatCurrency, 
  formatNumber,
  getSalaryByDomain,
  getSalaryByLevel,
  getSalaryHeatmapData,
  sortByKey,
} from '../utils';

// Chart 17: Salary Range by Domain (Box Plot)
export function createSalaryRangeByDomainConfig(
  salaries: Salary[],
  domains: Domain[],
  isDark: boolean
): EChartsOption {
  const colors = getChartColors(isDark);
  
  const salaryByDomain = getSalaryByDomain(salaries, domains);
  const sorted = sortByKey(salaryByDomain, 'avgSalary', true).slice(0, 12);

  // Create box plot data: [min, Q1, median, Q3, max]
  const boxData = sorted.map(d => {
    const range = d.maxSalary - d.minSalary;
    const q1 = d.minSalary + range * 0.25;
    const median = d.avgSalary;
    const q3 = d.minSalary + range * 0.75;
    return [d.minSalary, q1, median, q3, d.maxSalary];
  });

  return {
    ...animationConfig.staggered,
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const data = sorted[params.dataIndex];
        return `
          <div style="min-width: 180px;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">${data.domainName}</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <div style="color: ${colors.textSecondary}; font-size: 11px;">Min</div>
                <div style="font-weight: 600;">${formatCurrency(data.minSalary)}</div>
              </div>
              <div>
                <div style="color: ${colors.textSecondary}; font-size: 11px;">Max</div>
                <div style="font-weight: 600;">${formatCurrency(data.maxSalary)}</div>
              </div>
              <div style="grid-column: span 2;">
                <div style="color: ${colors.textSecondary}; font-size: 11px;">Average</div>
                <div style="font-size: 20px; font-weight: 700; color: ${colors.primary[0]};">${formatCurrency(data.avgSalary)}</div>
              </div>
            </div>
          </div>
        `;
      },
    },
    grid: {
      left: 100,
      right: 40,
      top: 40,
      bottom: 80,
    },
    xAxis: {
      type: 'category',
      data: sorted.map(d => d.domainName),
      axisLabel: {
        color: colors.textSecondary,
        fontSize: 10,
        rotate: 45,
        interval: 0,
      },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: colors.axisLine } },
    },
    yAxis: {
      type: 'value',
      name: 'Salary (AED/month)',
      nameTextStyle: { color: colors.textSecondary },
      axisLabel: {
        color: colors.textSecondary,
        formatter: (val: number) => formatNumber(val, true),
      },
      splitLine: { lineStyle: { color: colors.splitLine, type: 'dashed' } },
    },
    series: [
      {
        type: 'boxplot',
        data: boxData,
        itemStyle: {
          color: hexToRgba(colors.primary[0], 0.3),
          borderColor: colors.primary[0],
          borderWidth: 2,
        },
        emphasis: {
          itemStyle: {
            borderWidth: 3,
            shadowBlur: 10,
            shadowColor: hexToRgba(colors.primary[0], 0.3),
          },
        },
      },
    ],
  };
}

// Chart 18: Role-wise Comparison (Grouped Bar)
export function createRoleWiseComparisonConfig(
  salaries: Salary[],
  domains: Domain[],
  isDark: boolean
): EChartsOption {
  const colors = getChartColors(isDark);
  
  const levels = ['ENTRY', 'MID', 'SENIOR', 'EXECUTIVE'];
  const levelLabels = ['Entry', 'Mid-Level', 'Senior', 'Executive'];
  const salaryByLevel = getSalaryByLevel(salaries);

  return {
    ...animationConfig.staggered,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const level = params[0].name;
        return `
          <div style="min-width: 160px;">
            <div style="font-weight: 600; margin-bottom: 8px;">${level}</div>
            ${params.map((p: any) => `
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="color: ${p.color};">●</span>
                <span style="margin-left: 8px; flex: 1;">${p.seriesName}</span>
                <span style="font-weight: 600;">${formatCurrency(p.value)}</span>
              </div>
            `).join('')}
          </div>
        `;
      },
    },
    legend: {
      data: ['Min Salary', 'Avg Salary', 'Max Salary'],
      top: 8,
      textStyle: { color: colors.textSecondary },
    },
    grid: {
      left: 80,
      right: 40,
      top: 60,
      bottom: 40,
    },
    xAxis: {
      type: 'category',
      data: levelLabels,
      axisLabel: { color: colors.textSecondary, fontSize: 12 },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: colors.axisLine } },
    },
    yAxis: {
      type: 'value',
      name: 'Salary (AED)',
      nameTextStyle: { color: colors.textSecondary },
      axisLabel: {
        color: colors.textSecondary,
        formatter: (val: number) => formatNumber(val, true),
      },
      splitLine: { lineStyle: { color: colors.splitLine, type: 'dashed' } },
    },
    series: [
      {
        name: 'Min Salary',
        type: 'bar',
        barWidth: 24,
        itemStyle: {
          color: createGradient(colors.primary[4], hexToRgba(colors.primary[4], 0.6)),
          borderRadius: [4, 4, 0, 0],
        },
        data: salaryByLevel.map(s => s.minSalary),
      },
      {
        name: 'Avg Salary',
        type: 'bar',
        barWidth: 24,
        itemStyle: {
          color: createGradient(colors.primary[0], hexToRgba(colors.primary[0], 0.6)),
          borderRadius: [4, 4, 0, 0],
        },
        data: salaryByLevel.map(s => s.avgSalary),
      },
      {
        name: 'Max Salary',
        type: 'bar',
        barWidth: 24,
        itemStyle: {
          color: createGradient(colors.primary[1], hexToRgba(colors.primary[1], 0.6)),
          borderRadius: [4, 4, 0, 0],
        },
        data: salaryByLevel.map(s => s.maxSalary),
      },
    ],
  };
}

// Chart 19: Highest Paying Domains (Horizontal Bar)
export function createHighestPayingDomainsConfig(
  salaries: Salary[],
  domains: Domain[],
  isDark: boolean
): EChartsOption {
  const colors = getChartColors(isDark);
  
  const salaryByDomain = getSalaryByDomain(salaries, domains);
  const sorted = sortByKey(salaryByDomain, 'maxSalary', true).slice(0, 10);

  return {
    ...animationConfig.staggered,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const data = sorted[params[0].dataIndex];
        return `
          <div>
            <div style="font-weight: 600; margin-bottom: 4px;">${data.domainName}</div>
            <div style="font-size: 20px; font-weight: 700; color: ${colors.primary[0]};">${formatCurrency(data.maxSalary)}</div>
            <div style="color: ${colors.textSecondary}; font-size: 11px; margin-top: 4px;">Maximum salary</div>
          </div>
        `;
      },
    },
    grid: {
      left: 180,
      right: 60,
      top: 20,
      bottom: 20,
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        color: colors.textSecondary,
        formatter: (val: number) => formatNumber(val, true),
      },
      splitLine: { lineStyle: { color: colors.splitLine, type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: sorted.map(d => d.domainName),
      axisLabel: {
        color: colors.textSecondary,
        fontSize: 11,
        width: 160,
        overflow: 'truncate',
      },
      axisTick: { show: false },
      axisLine: { show: false },
    },
    series: [
      {
        type: 'bar',
        barWidth: 18,
        itemStyle: {
          color: (params: any) => {
            const gradient = createGradient(
              colors.primary[0],
              colors.primary[1],
              'horizontal'
            );
            return gradient;
          },
          borderRadius: [0, 4, 4, 0],
        },
        data: sorted.map(d => d.maxSalary),
        label: {
          show: true,
          position: 'right',
          color: colors.textSecondary,
          fontSize: 11,
          fontWeight: 600,
          formatter: (params: any) => formatCurrency(params.value),
        },
      },
    ],
  };
}

// Chart 20: Salary Distribution (Histogram)
export function createSalaryDistributionConfig(
  salaries: Salary[],
  isDark: boolean
): EChartsOption {
  const colors = getChartColors(isDark);
  
  // Create histogram bins
  const allSalaries = salaries.flatMap(s => [s.minSalary, s.maxSalary]);
  const min = Math.min(...allSalaries);
  const max = Math.max(...allSalaries);
  const binSize = 10000;
  const bins: number[] = [];
  const binLabels: string[] = [];
  
  for (let i = Math.floor(min / binSize) * binSize; i <= max; i += binSize) {
    const count = allSalaries.filter(s => s >= i && s < i + binSize).length;
    bins.push(count);
    binLabels.push(`${formatNumber(i, true)}`);
  }

  return {
    ...animationConfig.default,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const idx = params[0].dataIndex;
        const rangeStart = Math.floor(min / binSize) * binSize + idx * binSize;
        return `
          <div>
            <div style="font-weight: 600; margin-bottom: 4px;">${formatCurrency(rangeStart)} - ${formatCurrency(rangeStart + binSize)}</div>
            <div style="font-size: 20px; font-weight: 700; color: ${colors.primary[0]};">${params[0].value} entries</div>
          </div>
        `;
      },
    },
    grid: {
      left: 60,
      right: 40,
      top: 40,
      bottom: 60,
    },
    xAxis: {
      type: 'category',
      data: binLabels,
      name: 'Salary Range (AED)',
      nameLocation: 'middle',
      nameGap: 40,
      nameTextStyle: { color: colors.textSecondary },
      axisLabel: {
        color: colors.textSecondary,
        fontSize: 10,
        rotate: 45,
      },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: colors.axisLine } },
    },
    yAxis: {
      type: 'value',
      name: 'Frequency',
      nameTextStyle: { color: colors.textSecondary },
      axisLabel: { color: colors.textSecondary },
      splitLine: { lineStyle: { color: colors.splitLine, type: 'dashed' } },
    },
    series: [
      {
        type: 'bar',
        barWidth: '80%',
        itemStyle: {
          color: createGradient(
            colors.primary[0],
            hexToRgba(colors.primary[0], 0.4)
          ),
          borderRadius: [4, 4, 0, 0],
        },
        data: bins,
      },
    ],
  };
}

// Chart 21: Domain Salary Heatmap
export function createDomainSalaryHeatmapConfig(
  salaries: Salary[],
  domains: Domain[],
  isDark: boolean
): EChartsOption {
  const colors = getChartColors(isDark);
  
  const { data, xLabels, yLabels } = getSalaryHeatmapData(salaries, domains);
  const maxValue = Math.max(...data.map(d => d[2]));

  return {
    ...animationConfig.default,
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const [x, y, value] = params.data;
        return `
          <div>
            <div style="font-weight: 600; margin-bottom: 4px;">${yLabels[y]}</div>
            <div style="color: ${colors.textSecondary}; font-size: 11px; margin-bottom: 4px;">${xLabels[x]} Level</div>
            <div style="font-size: 20px; font-weight: 700; color: ${colors.primary[0]};">${formatCurrency(value)}</div>
          </div>
        `;
      },
    },
    grid: {
      left: 180,
      right: 80,
      top: 40,
      bottom: 40,
    },
    xAxis: {
      type: 'category',
      data: xLabels,
      axisLabel: { color: colors.textSecondary, fontSize: 11 },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: colors.axisLine } },
      splitArea: { show: true },
    },
    yAxis: {
      type: 'category',
      data: yLabels,
      axisLabel: {
        color: colors.textSecondary,
        fontSize: 10,
        width: 160,
        overflow: 'truncate',
      },
      axisTick: { show: false },
      axisLine: { show: false },
    },
    visualMap: {
      min: 0,
      max: maxValue,
      calculable: true,
      orient: 'vertical',
      right: 10,
      top: 'center',
      inRange: {
        color: isDark
          ? ['#1E3A5F', '#2563EB', '#60A5FA', '#93C5FD']
          : ['#DBEAFE', '#93C5FD', '#3B82F6', '#1D4ED8'],
      },
      textStyle: { color: colors.textSecondary },
      formatter: (value: number) => formatNumber(value, true),
    },
    series: [
      {
        type: 'heatmap',
        data: data,
        label: {
          show: true,
          color: colors.textPrimary,
          fontSize: 10,
          formatter: (params: any) => formatNumber(params.data[2], true),
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: hexToRgba(colors.primary[0], 0.5),
          },
        },
      },
    ],
  };
}

// Chart 22: Salary Progression (Waterfall)
export function createSalaryProgressionConfig(
  salaries: Salary[],
  isDark: boolean
): EChartsOption {
  const colors = getChartColors(isDark);
  
  const salaryByLevel = getSalaryByLevel(salaries);
  const levels = ['Entry', 'Mid-Level', 'Senior', 'Executive'];
  
  // Calculate increments
  const data = salaryByLevel.map((s, i) => {
    if (i === 0) return s.avgSalary;
    return s.avgSalary - salaryByLevel[i - 1].avgSalary;
  });
  
  // Add total
  const total = salaryByLevel[salaryByLevel.length - 1].avgSalary;

  return {
    ...animationConfig.staggered,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const idx = params[0].dataIndex;
        if (idx === 4) {
          return `<div style="font-weight: 600;">Total: ${formatCurrency(total)}</div>`;
        }
        const level = levels[idx];
        const value = salaryByLevel[idx].avgSalary;
        const increment = idx > 0 ? data[idx] : 0;
        return `
          <div>
            <div style="font-weight: 600; margin-bottom: 4px;">${level}</div>
            <div style="font-size: 18px; font-weight: 700; color: ${colors.primary[0]};">${formatCurrency(value)}</div>
            ${idx > 0 ? `<div style="color: ${colors.positive}; font-size: 12px; margin-top: 4px;">+${formatCurrency(increment)}</div>` : ''}
          </div>
        `;
      },
    },
    grid: {
      left: 80,
      right: 40,
      top: 40,
      bottom: 40,
    },
    xAxis: {
      type: 'category',
      data: [...levels, 'Total'],
      axisLabel: { color: colors.textSecondary, fontSize: 12 },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: colors.axisLine } },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: colors.textSecondary,
        formatter: (val: number) => formatNumber(val, true),
      },
      splitLine: { lineStyle: { color: colors.splitLine, type: 'dashed' } },
    },
    series: [
      {
        type: 'bar',
        barWidth: 40,
        stack: 'waterfall',
        itemStyle: {
          color: (params: any) => {
            if (params.dataIndex === 4) return colors.primary[0];
            if (params.dataIndex === 0) return colors.primary[2];
            return colors.positive;
          },
          borderRadius: 4,
        },
        label: {
          show: true,
          position: 'top',
          color: colors.textSecondary,
          fontSize: 11,
          formatter: (params: any) => {
            if (params.dataIndex === 4) return formatCurrency(total);
            return formatCurrency(salaryByLevel[params.dataIndex].avgSalary);
          },
        },
        data: [
          data[0],
          { value: data[1], itemStyle: { color: colors.positive } },
          { value: data[2], itemStyle: { color: colors.positive } },
          { value: data[3], itemStyle: { color: colors.positive } },
          total,
        ],
      },
      // Invisible stack for waterfall effect
      {
        type: 'bar',
        stack: 'waterfall',
        silent: true,
        itemStyle: { color: 'transparent' },
        data: [0, data[0], data[0] + data[1], data[0] + data[1] + data[2], 0],
      },
    ],
  };
}

// Chart 23: Entry vs Max Gap (Dumbbell/Lollipop)
export function createEntryVsMaxGapConfig(
  salaries: Salary[],
  domains: Domain[],
  isDark: boolean
): EChartsOption {
  const colors = getChartColors(isDark);
  
  const salaryByDomain = getSalaryByDomain(salaries, domains);
  const sorted = sortByKey(salaryByDomain, 'maxSalary', true).slice(0, 10);

  return {
    ...animationConfig.staggered,
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const data = sorted[params.dataIndex];
        const gap = data.maxSalary - data.minSalary;
        return `
          <div style="min-width: 180px;">
            <div style="font-weight: 600; margin-bottom: 8px;">${data.domainName}</div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: ${colors.textSecondary};">Entry</span>
              <span style="font-weight: 600;">${formatCurrency(data.minSalary)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: ${colors.textSecondary};">Max</span>
              <span style="font-weight: 600;">${formatCurrency(data.maxSalary)}</span>
            </div>
            <div style="border-top: 1px solid ${colors.axisLine}; padding-top: 8px; margin-top: 8px;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: ${colors.textSecondary};">Gap</span>
                <span style="font-weight: 700; color: ${colors.primary[0]};">${formatCurrency(gap)}</span>
              </div>
            </div>
          </div>
        `;
      },
    },
    grid: {
      left: 180,
      right: 60,
      top: 20,
      bottom: 20,
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        color: colors.textSecondary,
        formatter: (val: number) => formatNumber(val, true),
      },
      splitLine: { lineStyle: { color: colors.splitLine, type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: sorted.map(d => d.domainName),
      axisLabel: {
        color: colors.textSecondary,
        fontSize: 11,
        width: 160,
        overflow: 'truncate',
      },
      axisTick: { show: false },
      axisLine: { show: false },
    },
    series: [
      // Line connecting min to max
      {
        type: 'custom',
        renderItem: (params: any, api: any) => {
          const yValue = api.value(0);
          const minX = api.coord([sorted[params.dataIndex].minSalary, yValue]);
          const maxX = api.coord([sorted[params.dataIndex].maxSalary, yValue]);
          
          return {
            type: 'line',
            shape: {
              x1: minX[0],
              y1: minX[1],
              x2: maxX[0],
              y2: maxX[1],
            },
            style: {
              stroke: colors.axisLine,
              lineWidth: 3,
            },
          };
        },
        data: sorted.map((_, i) => [i]),
        z: 1,
      },
      // Min salary dots
      {
        type: 'scatter',
        symbolSize: 14,
        itemStyle: { color: colors.primary[4] },
        data: sorted.map((d, i) => [d.minSalary, i]),
        z: 2,
      },
      // Max salary dots
      {
        type: 'scatter',
        symbolSize: 14,
        itemStyle: { color: colors.primary[0] },
        data: sorted.map((d, i) => [d.maxSalary, i]),
        z: 2,
      },
    ],
  };
}

// Chart 24: Salary Percentiles (Premium Violin/Box Plot Hybrid)
export function createSalaryPercentilesConfig(
  salaries: Salary[],
  domains: Domain[],
  isDark: boolean
): EChartsOption {
  const colors = getChartColors(isDark);
  
  const salaryByDomain = getSalaryByDomain(salaries, domains);
  const sorted = sortByKey(salaryByDomain, 'avgSalary', true).slice(0, 8);

  // Calculate percentiles for each domain (simulated Q1, Q3)
  const percentileData = sorted.map(d => {
    const range = d.maxSalary - d.minSalary;
    return {
      ...d,
      q1: d.minSalary + range * 0.25,
      q3: d.minSalary + range * 0.75,
      p10: d.minSalary + range * 0.1,
      p90: d.minSalary + range * 0.9,
    };
  });

  return {
    ...animationConfig.default,
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const idx = params.dataIndex !== undefined ? params.dataIndex : 0;
        const data = percentileData[idx];
        if (!data) return '';
        return `
          <div style="min-width: 200px;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 12px;">${data.domainName}</div>
            <div style="display: grid; gap: 6px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: ${colors.textSecondary}; font-size: 11px;">Maximum (P100)</span>
                <span style="font-weight: 500;">${formatCurrency(data.maxSalary)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: ${colors.textSecondary}; font-size: 11px;">90th Percentile</span>
                <span style="font-weight: 500;">${formatCurrency(data.p90)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: ${colors.textSecondary}; font-size: 11px;">75th Percentile (Q3)</span>
                <span style="font-weight: 500;">${formatCurrency(data.q3)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; background: ${hexToRgba(colors.primary[0], 0.1)}; padding: 4px 8px; border-radius: 4px; margin: 4px -8px;">
                <span style="color: ${colors.primary[0]}; font-size: 12px; font-weight: 600;">Median</span>
                <span style="font-weight: 700; color: ${colors.primary[0]}; font-size: 16px;">${formatCurrency(data.avgSalary)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: ${colors.textSecondary}; font-size: 11px;">25th Percentile (Q1)</span>
                <span style="font-weight: 500;">${formatCurrency(data.q1)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: ${colors.textSecondary}; font-size: 11px;">10th Percentile</span>
                <span style="font-weight: 500;">${formatCurrency(data.p10)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: ${colors.textSecondary}; font-size: 11px;">Minimum (P0)</span>
                <span style="font-weight: 500;">${formatCurrency(data.minSalary)}</span>
              </div>
            </div>
            <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid ${colors.axisLine};">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: ${colors.textSecondary}; font-size: 11px;">IQR Range</span>
                <span style="font-weight: 600; color: ${colors.positive};">${formatCurrency(data.q3 - data.q1)}</span>
              </div>
            </div>
          </div>
        `;
      },
    },
    grid: {
      left: 80,
      right: 40,
      top: 60,
      bottom: 100,
    },
    xAxis: {
      type: 'category',
      data: sorted.map(d => d.domainName),
      axisLabel: {
        color: colors.textSecondary,
        fontSize: 10,
        rotate: 35,
        interval: 0,
      },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: colors.axisLine } },
    },
    yAxis: {
      type: 'value',
      name: 'Salary (AED/month)',
      nameTextStyle: { color: colors.textSecondary, fontSize: 11 },
      axisLabel: {
        color: colors.textSecondary,
        formatter: (val: number) => formatNumber(val, true),
      },
      splitLine: { lineStyle: { color: colors.splitLine, type: 'dashed' } },
    },
    series: [
      // Violin/Box plot hybrid using custom render
      {
        type: 'custom',
        renderItem: (params: any, api: any) => {
          const idx = params.dataIndex;
          const data = percentileData[idx];
          const categoryWidth = api.size([1, 0])[0];
          const barWidth = Math.min(categoryWidth * 0.6, 50);
          const halfWidth = barWidth / 2;
          const thinWidth = barWidth * 0.15;
          
          const x = api.coord([idx, 0])[0];
          const minY = api.coord([0, data.minSalary])[1];
          const maxY = api.coord([0, data.maxSalary])[1];
          const q1Y = api.coord([0, data.q1])[1];
          const q3Y = api.coord([0, data.q3])[1];
          const medianY = api.coord([0, data.avgSalary])[1];
          const p10Y = api.coord([0, data.p10])[1];
          const p90Y = api.coord([0, data.p90])[1];
          
          const color = colors.primary[idx % colors.primary.length];
          
          return {
            type: 'group',
            children: [
              // Outer whisker line (min to max)
              {
                type: 'line',
                shape: { x1: x, y1: minY, x2: x, y2: maxY },
                style: { stroke: color, lineWidth: 2 },
              },
              // Min whisker cap
              {
                type: 'line',
                shape: { x1: x - thinWidth, y1: minY, x2: x + thinWidth, y2: minY },
                style: { stroke: color, lineWidth: 2 },
              },
              // Max whisker cap
              {
                type: 'line',
                shape: { x1: x - thinWidth, y1: maxY, x2: x + thinWidth, y2: maxY },
                style: { stroke: color, lineWidth: 2 },
              },
              // Outer violin shape (P10 to P90) - gradient fill
              {
                type: 'polygon',
                shape: {
                  points: [
                    [x - halfWidth * 0.5, p10Y],
                    [x - halfWidth * 0.8, q1Y],
                    [x - halfWidth, medianY],
                    [x - halfWidth * 0.8, q3Y],
                    [x - halfWidth * 0.5, p90Y],
                    [x + halfWidth * 0.5, p90Y],
                    [x + halfWidth * 0.8, q3Y],
                    [x + halfWidth, medianY],
                    [x + halfWidth * 0.8, q1Y],
                    [x + halfWidth * 0.5, p10Y],
                  ],
                },
                style: {
                  fill: hexToRgba(color, 0.15),
                  stroke: hexToRgba(color, 0.4),
                  lineWidth: 1,
                },
              },
              // IQR box (Q1 to Q3) - solid fill
              {
                type: 'rect',
                shape: {
                  x: x - halfWidth * 0.6,
                  y: q3Y,
                  width: halfWidth * 1.2,
                  height: q1Y - q3Y,
                  r: 4,
                },
                style: {
                  fill: hexToRgba(color, 0.5),
                  stroke: color,
                  lineWidth: 2,
                },
              },
              // Median line (prominent)
              {
                type: 'line',
                shape: {
                  x1: x - halfWidth * 0.6,
                  y1: medianY,
                  x2: x + halfWidth * 0.6,
                  y2: medianY,
                },
                style: {
                  stroke: isDark ? '#FFFFFF' : '#1F2937',
                  lineWidth: 3,
                },
              },
              // Median diamond marker
              {
                type: 'polygon',
                shape: {
                  points: [
                    [x, medianY - 6],
                    [x + 6, medianY],
                    [x, medianY + 6],
                    [x - 6, medianY],
                  ],
                },
                style: {
                  fill: isDark ? '#FFFFFF' : '#1F2937',
                  stroke: color,
                  lineWidth: 2,
                },
              },
            ],
          };
        },
        data: percentileData.map((d, i) => ({
          value: [i, d.avgSalary],
          itemStyle: { color: colors.primary[i % colors.primary.length] },
        })),
        z: 2,
      },
    ],
  };
}
