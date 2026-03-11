/**
 * Initiative/Trends Chart Configurations
 * Charts 1-8: UAE Initiatives Timeline, KPI Dashboard, Regional Distribution, etc.
 */

import type { EChartsOption } from 'echarts';
import type { Initiative } from '@shared/schema';
import { getChartColors, animationConfig } from '../theme';
import { 
  formatYear, 
  formatYearRange, 
  mapScopeToEmirate, 
  hexToRgba,
  createGradient,
  groupBy 
} from '../utils';

// Chart 1: UAE Initiatives Timeline (Gantt-style)
export function createInitiativesTimelineConfig(
  initiatives: Initiative[],
  isDark: boolean
): EChartsOption {
  const colors = getChartColors(isDark);
  
  // Sort by start year
  const sorted = [...initiatives].sort((a, b) => a.timeframeStart - b.timeframeStart);
  
  // Color by scope/emirate
  const scopeColors: Record<string, string> = {
    'Dubai': colors.primary[0],
    'Abu Dhabi': colors.primary[1],
    'Sharjah': colors.primary[4],
    'Fujairah': colors.primary[3],
    'UAE (Federal)': colors.primary[2],
    'UAE (Federal / multi-emirate)': colors.primary[2],
  };
  
  const data = sorted.map((init, index) => ({
    name: init.name,
    value: [
      index,
      init.timeframeStart,
      init.timeframeEnd,
      init.timeframeEnd - init.timeframeStart,
    ],
    itemStyle: {
      color: createGradient(
        scopeColors[init.scope] || colors.primary[index % colors.primary.length],
        hexToRgba(scopeColors[init.scope] || colors.primary[index % colors.primary.length], 0.7),
        'horizontal'
      ),
      borderRadius: 4,
    },
    initiative: init,
  }));

  return {
    ...animationConfig.staggered,
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const init = params.data.initiative as Initiative;
        return `
          <div style="max-width: 320px;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">${init.name}</div>
            <div style="display: flex; gap: 16px; margin-bottom: 8px;">
              <span style="color: ${colors.textSecondary};">Scope:</span>
              <span style="font-weight: 500;">${init.scope}</span>
            </div>
            <div style="display: flex; gap: 16px; margin-bottom: 8px;">
              <span style="color: ${colors.textSecondary};">Timeline:</span>
              <span style="font-weight: 500;">${formatYearRange(init.timeframeStart, init.timeframeEnd)}</span>
            </div>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid ${colors.axisLine};">
              <div style="color: ${colors.textSecondary}; font-size: 11px; margin-bottom: 4px;">KPI Target</div>
              <div style="font-size: 12px; line-height: 1.4;">${init.kpiTarget}</div>
            </div>
            <div style="margin-top: 8px;">
              <div style="color: ${colors.textSecondary}; font-size: 11px; margin-bottom: 4px;">Domains Impacted</div>
              <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                ${init.domainsImpacted.slice(0, 4).map(d => 
                  `<span style="background: ${hexToRgba(colors.primary[0], 0.15)}; padding: 2px 8px; border-radius: 4px; font-size: 11px;">${d}</span>`
                ).join('')}
                ${init.domainsImpacted.length > 4 ? `<span style="color: ${colors.textSecondary}; font-size: 11px;">+${init.domainsImpacted.length - 4} more</span>` : ''}
              </div>
            </div>
          </div>
        `;
      },
    },
    grid: {
      left: 200,
      right: 40,
      top: 60,
      bottom: 60,
    },
    xAxis: {
      type: 'value',
      min: 2020,
      max: 2055,
      interval: 5,
      axisLabel: {
        formatter: (val: number) => formatYear(val),
        color: colors.textSecondary,
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: colors.splitLine,
          type: 'dashed',
        },
      },
    },
    yAxis: {
      type: 'category',
      data: sorted.map(i => i.name),
      axisLabel: {
        color: colors.textSecondary,
        width: 180,
        overflow: 'truncate',
        fontSize: 11,
      },
      axisTick: { show: false },
      axisLine: { show: false },
    },
    series: [
      {
        type: 'custom',
        renderItem: (params: any, api: any) => {
          const categoryIndex = api.value(0);
          const start = api.coord([api.value(1), categoryIndex]);
          const end = api.coord([api.value(2), categoryIndex]);
          const height = 20;
          
          return {
            type: 'rect',
            shape: {
              x: start[0],
              y: start[1] - height / 2,
              width: end[0] - start[0],
              height: height,
              r: 4,
            },
            style: api.style(),
            emphasis: {
              style: {
                shadowBlur: 10,
                shadowColor: hexToRgba(colors.primary[0], 0.3),
              },
            },
          };
        },
        encode: {
          x: [1, 2],
          y: 0,
        },
        data: data,
      },
    ],
    // Legend for scopes
    legend: {
      data: Object.keys(scopeColors),
      top: 8,
      right: 16,
      textStyle: { color: colors.textSecondary, fontSize: 11 },
    },
  };
}

// Chart 2: Initiative KPI Dashboard (Multi-gauge)
export function createKPIDashboardConfig(
  initiatives: Initiative[],
  isDark: boolean
): EChartsOption {
  const colors = getChartColors(isDark);
  
  // Extract KPI metrics from initiatives
  const kpis = [
    { name: 'Tech Adoption', value: 75, target: 100, unit: '%', color: colors.primary[0] },
    { name: 'Carbon Reduction', value: 30, target: 100, unit: '%', color: colors.primary[1] },
    { name: 'Trade Growth', value: 65, target: 100, unit: '%', color: colors.primary[2] },
    { name: 'Capacity (TEU)', value: 10.5, target: 15, unit: 'M', color: colors.primary[3] },
  ];

  const gauges = kpis.map((kpi, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const centerX = 25 + col * 50;
    const centerY = 35 + row * 45;
    
    return {
      type: 'gauge' as const,
      center: [`${centerX}%`, `${centerY}%`],
      radius: '35%',
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: kpi.target,
      splitNumber: 5,
      itemStyle: {
        color: createGradient(kpi.color, hexToRgba(kpi.color, 0.6)),
      },
      progress: {
        show: true,
        width: 12,
        roundCap: true,
      },
      pointer: {
        show: false,
      },
      axisLine: {
        lineStyle: {
          width: 12,
          color: [[1, colors.splitLine]],
        },
        roundCap: true,
      },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      title: {
        show: true,
        offsetCenter: [0, '70%'],
        fontSize: 13,
        fontWeight: 500,
        color: colors.textSecondary,
      },
      detail: {
        valueAnimation: true,
        offsetCenter: [0, '30%'],
        fontSize: 28,
        fontWeight: 700,
        formatter: `{value}${kpi.unit}`,
        color: colors.textPrimary,
      },
      data: [{ value: kpi.value, name: kpi.name }],
    };
  });

  return {
    ...animationConfig.default,
    series: gauges,
  };
}

// Chart 3: Regional Distribution (UAE Map alternative - Pie/Treemap)
export function createRegionalDistributionConfig(
  initiatives: Initiative[],
  isDark: boolean
): EChartsOption {
  const colors = getChartColors(isDark);
  
  // Group by scope/emirate
  const byScope = groupBy(initiatives, 'scope');
  const data = Object.entries(byScope).map(([scope, inits], index) => ({
    name: scope.replace('UAE (Federal / multi-emirate)', 'Federal').replace('UAE (Federal)', 'Federal'),
    value: inits.length,
    initiatives: inits,
    itemStyle: {
      color: colors.primary[index % colors.primary.length],
    },
  }));

  return {
    ...animationConfig.default,
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const { name, value, data } = params;
        const inits = data.initiatives as Initiative[];
        return `
          <div style="min-width: 200px;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">${name}</div>
            <div style="font-size: 24px; font-weight: 700; color: ${colors.primary[0]}; margin-bottom: 8px;">${value} Initiatives</div>
            <div style="border-top: 1px solid ${colors.axisLine}; padding-top: 8px;">
              ${inits.slice(0, 3).map(i => `<div style="font-size: 12px; margin-bottom: 4px;">• ${i.name}</div>`).join('')}
              ${inits.length > 3 ? `<div style="color: ${colors.textSecondary}; font-size: 11px;">+${inits.length - 3} more</div>` : ''}
            </div>
          </div>
        `;
      },
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: isDark ? '#1F2937' : '#FFFFFF',
          borderWidth: 3,
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}\n{c} ({d}%)',
          color: colors.textPrimary,
          fontSize: 12,
          lineHeight: 18,
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 10,
          lineStyle: {
            color: colors.axisLine,
          },
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowColor: hexToRgba(colors.primary[0], 0.3),
          },
          label: {
            fontSize: 14,
            fontWeight: 600,
          },
        },
        data: data,
      },
    ],
  };
}

// Chart 4: Sector Impact Analysis (Sankey)
export function createSectorImpactConfig(
  initiatives: Initiative[],
  isDark: boolean
): EChartsOption {
  const colors = getChartColors(isDark);
  
  // Build nodes and links
  const initiativeNodes = initiatives.map(i => ({ name: i.name }));
  const domainSet = new Set<string>();
  initiatives.forEach(i => i.domainsImpacted.forEach(d => domainSet.add(d)));
  const domainNodes = Array.from(domainSet).map(d => ({ name: d }));
  
  const links: { source: string; target: string; value: number }[] = [];
  initiatives.forEach(init => {
    init.domainsImpacted.forEach(domain => {
      links.push({
        source: init.name,
        target: domain,
        value: 1,
      });
    });
  });

  return {
    ...animationConfig.default,
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      formatter: (params: any) => {
        if (params.dataType === 'edge') {
          return `${params.data.source} → ${params.data.target}`;
        }
        return params.name;
      },
    },
    series: [
      {
        type: 'sankey',
        layout: 'none',
        emphasis: {
          focus: 'adjacency',
        },
        nodeAlign: 'left',
        nodeGap: 12,
        nodeWidth: 20,
        layoutIterations: 32,
        data: [...initiativeNodes, ...domainNodes].map((node, i) => ({
          ...node,
          itemStyle: {
            color: colors.primary[i % colors.primary.length],
            borderRadius: 4,
          },
        })),
        links: links,
        lineStyle: {
          color: 'gradient',
          curveness: 0.5,
          opacity: 0.4,
        },
        label: {
          color: colors.textPrimary,
          fontSize: 11,
          position: 'right',
        },
      },
    ],
  };
}

// Chart 5: Target Achievement (Bullet charts)
export function createTargetAchievementConfig(
  initiatives: Initiative[],
  isDark: boolean
): EChartsOption {
  const colors = getChartColors(isDark);
  
  // Sample achievement data (would come from real KPIs)
  const targets = [
    { name: 'Tech Adoption', current: 72, target: 75, max: 100 },
    { name: 'Carbon Reduction', current: 28, target: 30, max: 100 },
    { name: 'Trade Volume', current: 3.2, target: 4.0, max: 5 },
    { name: 'Port Capacity', current: 8.5, target: 10.5, max: 15 },
    { name: 'Rail Freight', current: 45, target: 60, max: 100 },
  ];

  return {
    ...animationConfig.staggered,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const data = targets[params[0].dataIndex];
        const progress = ((data.current / data.target) * 100).toFixed(0);
        return `
          <div style="min-width: 180px;">
            <div style="font-weight: 600; margin-bottom: 8px;">${data.name}</div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: ${colors.textSecondary};">Current</span>
              <span style="font-weight: 600;">${data.current}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: ${colors.textSecondary};">Target</span>
              <span style="font-weight: 600;">${data.target}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: ${colors.textSecondary};">Progress</span>
              <span style="font-weight: 600; color: ${Number(progress) >= 100 ? colors.positive : colors.primary[0]};">${progress}%</span>
            </div>
          </div>
        `;
      },
    },
    grid: {
      left: 120,
      right: 40,
      top: 40,
      bottom: 40,
    },
    xAxis: {
      type: 'value',
      max: (value: { max: number }) => Math.ceil(value.max * 1.1),
      axisLabel: { color: colors.textSecondary },
      splitLine: { lineStyle: { color: colors.splitLine, type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: targets.map(t => t.name),
      axisLabel: { color: colors.textSecondary, fontSize: 12 },
      axisTick: { show: false },
      axisLine: { show: false },
    },
    series: [
      // Background (max range)
      {
        type: 'bar',
        barWidth: 24,
        silent: true,
        itemStyle: {
          color: colors.splitLine,
          borderRadius: 4,
        },
        data: targets.map(t => t.max),
        z: 1,
      },
      // Target marker
      {
        type: 'bar',
        barWidth: 24,
        barGap: '-100%',
        itemStyle: {
          color: 'transparent',
          borderColor: colors.textSecondary,
          borderWidth: 2,
          borderType: 'dashed',
          borderRadius: 4,
        },
        data: targets.map(t => t.target),
        z: 2,
      },
      // Current value
      {
        type: 'bar',
        barWidth: 16,
        barGap: '-100%',
        itemStyle: {
          color: (params: any) => {
            const data = targets[params.dataIndex];
            const progress = data.current / data.target;
            return progress >= 1 ? colors.positive : colors.primary[0];
          },
          borderRadius: 4,
        },
        data: targets.map(t => t.current),
        z: 3,
      },
    ],
  };
}

// Chart 6: Categories Breakdown (Sunburst)
export function createCategoriesBreakdownConfig(
  initiatives: Initiative[],
  isDark: boolean
): EChartsOption {
  const colors = getChartColors(isDark);
  
  // Group by category
  const byCategory = groupBy(initiatives, 'category');
  
  const data = Object.entries(byCategory).map(([category, inits], catIndex) => ({
    name: category,
    itemStyle: { color: colors.primary[catIndex % colors.primary.length] },
    children: inits.map((init, initIndex) => ({
      name: init.name,
      value: init.domainsImpacted.length,
      itemStyle: { 
        color: hexToRgba(colors.primary[catIndex % colors.primary.length], 0.7 - initIndex * 0.1) 
      },
    })),
  }));

  return {
    ...animationConfig.default,
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const { name, value, treePathInfo } = params;
        const path = treePathInfo.map((p: any) => p.name).filter(Boolean).join(' → ');
        return `
          <div>
            <div style="color: ${colors.textSecondary}; font-size: 11px; margin-bottom: 4px;">${path}</div>
            <div style="font-weight: 600;">${name}</div>
            ${value ? `<div style="font-size: 18px; font-weight: 700; color: ${colors.primary[0]}; margin-top: 4px;">${value} domains</div>` : ''}
          </div>
        `;
      },
    },
    series: [
      {
        type: 'sunburst',
        radius: ['15%', '90%'],
        sort: undefined,
        emphasis: {
          focus: 'ancestor',
        },
        data: data,
        label: {
          rotate: 'radial',
          color: colors.textPrimary,
          fontSize: 10,
          minAngle: 15,
        },
        itemStyle: {
          borderRadius: 4,
          borderWidth: 2,
          borderColor: isDark ? '#1F2937' : '#FFFFFF',
        },
        levels: [
          {},
          {
            r0: '15%',
            r: '45%',
            label: {
              fontSize: 12,
              fontWeight: 600,
            },
          },
          {
            r0: '45%',
            r: '90%',
            label: {
              fontSize: 10,
            },
          },
        ],
      },
    ],
  };
}

// Chart 7: Investment & Capacity (Area chart)
export function createInvestmentCapacityConfig(
  initiatives: Initiative[],
  isDark: boolean
): EChartsOption {
  const colors = getChartColors(isDark);
  
  // Generate projection data
  const years = Array.from({ length: 11 }, (_, i) => 2020 + i);
  const teuCapacity = years.map((year, i) => 15 + i * 2.5 + Math.random() * 2);
  const gdpContribution = years.map((year, i) => 133 + i * 16.7 + Math.random() * 10);

  return {
    ...animationConfig.default,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: { color: colors.textSecondary },
      },
    },
    legend: {
      data: ['TEU Capacity (M)', 'GDP Contribution (B AED)'],
      top: 8,
      textStyle: { color: colors.textSecondary },
    },
    grid: {
      left: 60,
      right: 60,
      top: 60,
      bottom: 40,
    },
    xAxis: {
      type: 'category',
      data: years.map(String),
      axisLabel: { color: colors.textSecondary },
      axisLine: { lineStyle: { color: colors.axisLine } },
    },
    yAxis: [
      {
        type: 'value',
        name: 'TEU (M)',
        nameTextStyle: { color: colors.textSecondary },
        axisLabel: { color: colors.textSecondary },
        splitLine: { lineStyle: { color: colors.splitLine, type: 'dashed' } },
      },
      {
        type: 'value',
        name: 'GDP (B AED)',
        nameTextStyle: { color: colors.textSecondary },
        axisLabel: { color: colors.textSecondary },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: 'TEU Capacity (M)',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 3, color: colors.primary[0] },
        itemStyle: { color: colors.primary[0] },
        areaStyle: {
          color: createGradient(
            hexToRgba(colors.primary[0], 0.4),
            hexToRgba(colors.primary[0], 0.05)
          ),
        },
        data: teuCapacity.map(v => v.toFixed(1)),
      },
      {
        name: 'GDP Contribution (B AED)',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 3, color: colors.primary[1] },
        itemStyle: { color: colors.primary[1] },
        areaStyle: {
          color: createGradient(
            hexToRgba(colors.primary[1], 0.4),
            hexToRgba(colors.primary[1], 0.05)
          ),
        },
        data: gdpContribution.map(v => v.toFixed(0)),
      },
    ],
  };
}

// Chart 8: Sustainability Goals (Progress rings)
export function createSustainabilityGoalsConfig(
  initiatives: Initiative[],
  isDark: boolean
): EChartsOption {
  const colors = getChartColors(isDark);
  
  const goals = [
    { name: 'Net Zero 2050', progress: 18, target: 2050, current: 2024, color: colors.primary[1] },
    { name: 'Carbon -30%', progress: 45, target: 30, current: 13.5, color: colors.primary[4] },
    { name: 'Tech Adoption 75%', progress: 72, target: 75, current: 54, color: colors.primary[0] },
    { name: 'Trade 4T AED', progress: 55, target: 4, current: 2.2, color: colors.primary[3] },
  ];

  const series = goals.map((goal, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const centerX = 28 + col * 44;
    const centerY = 28 + row * 44;
    
    return [
      // Background ring
      {
        type: 'pie' as const,
        radius: ['38%', '48%'],
        center: [`${centerX}%`, `${centerY}%`],
        silent: true,
        data: [
          { value: 100, itemStyle: { color: colors.splitLine } },
        ],
        label: { show: false },
      },
      // Progress ring
      {
        type: 'pie' as const,
        radius: ['38%', '48%'],
        center: [`${centerX}%`, `${centerY}%`],
        startAngle: 90,
        data: [
          { 
            value: goal.progress, 
            itemStyle: { 
              color: createGradient(goal.color, hexToRgba(goal.color, 0.6)),
              borderRadius: 10,
            } 
          },
          { 
            value: 100 - goal.progress, 
            itemStyle: { color: 'transparent' } 
          },
        ],
        label: {
          show: true,
          position: 'center',
          formatter: () => `{value|${goal.progress}%}\n{name|${goal.name}}`,
          rich: {
            value: {
              fontSize: 18,
              fontWeight: 700,
              color: colors.textPrimary,
              lineHeight: 24,
            },
            name: {
              fontSize: 10,
              color: colors.textSecondary,
              lineHeight: 16,
            },
          },
        },
        labelLine: { show: false },
      },
    ];
  }).flat();

  return {
    ...animationConfig.default,
    grid: {
      containLabel: true,
      left: '5%',
      right: '5%',
      top: '5%',
      bottom: '5%',
    },
    series: series,
  };
}
