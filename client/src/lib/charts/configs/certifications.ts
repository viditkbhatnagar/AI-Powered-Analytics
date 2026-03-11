/**
 * Certification Chart Configurations
 * Charts 25-30: Certification Pathway, Provider Distribution, ROI, etc.
 */

import type { EChartsOption } from 'echarts';
import type { Certification, Role } from '@shared/schema';
import { getChartColors, animationConfig } from '../theme';
import { 
  hexToRgba, 
  createGradient, 
  formatCurrency, 
  formatNumber,
  getCertificationsByProvider,
  groupBy,
} from '../utils';

// Chart 25: Certification Pathway (Sankey)
export function createCertificationPathwayConfig(
  certifications: Certification[],
  roles: Role[],
  isDark: boolean
): EChartsOption {
  const colors = getChartColors(isDark);
  
  // Build sankey data: Roles -> Certifications -> Benefits
  const roleCategories = ['Entry', 'Mid-Level', 'Senior', 'Executive'];
  const providers = [...new Set(certifications.map(c => c.provider))];
  const benefits = ['Career Growth', 'Higher Salary', 'Industry Recognition', 'Global Mobility'];
  
  const nodes = [
    ...roleCategories.map((r, i) => ({ name: r, itemStyle: { color: colors.primary[i] } })),
    ...providers.map((p, i) => ({ name: p, itemStyle: { color: colors.primary[(i + 4) % colors.primary.length] } })),
    ...benefits.map((b, i) => ({ name: b, itemStyle: { color: colors.primary[(i + 7) % colors.primary.length] } })),
  ];
  
  // Create links
  const links: { source: string; target: string; value: number }[] = [];
  
  // Roles to Certifications
  roleCategories.forEach((role, ri) => {
    providers.forEach((provider, pi) => {
      const count = certifications.filter(c => c.provider === provider).length;
      if (count > 0) {
        links.push({
          source: role,
          target: provider,
          value: Math.max(1, Math.floor(count / 2) + (ri === 1 || ri === 2 ? 2 : 1)),
        });
      }
    });
  });
  
  // Certifications to Benefits
  providers.forEach(provider => {
    benefits.forEach((benefit, bi) => {
      links.push({
        source: provider,
        target: benefit,
        value: Math.floor(Math.random() * 3) + 1,
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
          return `<div style="font-weight: 500;">${params.data.source} → ${params.data.target}</div>`;
        }
        return `<div style="font-weight: 600;">${params.name}</div>`;
      },
    },
    series: [
      {
        type: 'sankey',
        layout: 'none',
        emphasis: {
          focus: 'adjacency',
        },
        nodeAlign: 'justify',
        nodeGap: 14,
        nodeWidth: 24,
        layoutIterations: 32,
        data: nodes,
        links: links,
        lineStyle: {
          color: 'gradient',
          curveness: 0.5,
          opacity: 0.4,
        },
        label: {
          color: colors.textPrimary,
          fontSize: 11,
          fontWeight: 500,
        },
        itemStyle: {
          borderRadius: 4,
        },
      },
    ],
  };
}

// Chart 26: Provider Distribution (Donut)
export function createProviderDistributionConfig(
  certifications: Certification[],
  isDark: boolean
): EChartsOption {
  const colors = getChartColors(isDark);
  
  const byProvider = getCertificationsByProvider(certifications);
  
  const data = byProvider.map((p, i) => ({
    name: p.provider,
    value: p.count,
    itemStyle: { color: colors.primary[i % colors.primary.length] },
  }));

  return {
    ...animationConfig.default,
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const provider = byProvider.find(p => p.provider === params.name);
        return `
          <div style="min-width: 160px;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">${params.name}</div>
            <div style="font-size: 24px; font-weight: 700; color: ${colors.primary[0]}; margin-bottom: 8px;">
              ${params.value} certifications
            </div>
            <div style="color: ${colors.textSecondary}; font-size: 12px;">${params.percent.toFixed(1)}% of total</div>
            ${provider ? `
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid ${colors.axisLine};">
                <div style="display: flex; justify-content: space-between; font-size: 12px;">
                  <span style="color: ${colors.textSecondary};">Avg Cost</span>
                  <span>${formatCurrency(provider.avgCost)}</span>
                </div>
              </div>
            ` : ''}
          </div>
        `;
      },
    },
    legend: {
      orient: 'vertical',
      right: 20,
      top: 'center',
      textStyle: { color: colors.textSecondary, fontSize: 11 },
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: isDark ? '#1F2937' : '#FFFFFF',
          borderWidth: 3,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 700,
            color: colors.textPrimary,
          },
          itemStyle: {
            shadowBlur: 20,
            shadowColor: hexToRgba(colors.primary[0], 0.3),
          },
        },
        labelLine: { show: false },
        data: data,
      },
    ],
  };
}

// Chart 27: Certifications by Domain (Stacked Bar)
export function createCertsByDomainConfig(
  certifications: Certification[],
  isDark: boolean
): EChartsOption {
  const colors = getChartColors(isDark);
  
  // Simulated domain-certification mapping
  const domains = [
    'Supply Chain Planning',
    'Procurement',
    'Logistics',
    'Warehousing',
    'Transportation',
    'Trade Compliance',
  ];
  
  const providers = [...new Set(certifications.map(c => c.provider))].slice(0, 5);
  
  // Generate data
  const seriesData = providers.map((provider, pi) => ({
    name: provider,
    type: 'bar' as const,
    stack: 'total',
    barWidth: 30,
    itemStyle: {
      color: colors.primary[pi % colors.primary.length],
      borderRadius: pi === providers.length - 1 ? [4, 4, 0, 0] : 0,
    },
    emphasis: {
      focus: 'series' as const,
    },
    data: domains.map(() => Math.floor(Math.random() * 5) + 1),
  }));

  return {
    ...animationConfig.staggered,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    legend: {
      data: providers,
      top: 8,
      textStyle: { color: colors.textSecondary, fontSize: 11 },
    },
    grid: {
      left: 20,
      right: 20,
      top: 60,
      bottom: 60,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: domains,
      axisLabel: {
        color: colors.textSecondary,
        fontSize: 10,
        rotate: 30,
        interval: 0,
      },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: colors.axisLine } },
    },
    yAxis: {
      type: 'value',
      name: 'Certifications',
      nameTextStyle: { color: colors.textSecondary },
      axisLabel: { color: colors.textSecondary },
      splitLine: { lineStyle: { color: colors.splitLine, type: 'dashed' } },
    },
    series: seriesData,
  };
}

// Chart 28: Career Progression Timeline
export function createCareerProgressionConfig(
  certifications: Certification[],
  isDark: boolean
): EChartsOption {
  const colors = getChartColors(isDark);
  
  // Career milestones with certifications
  const milestones = [
    { year: 0, level: 'Entry', certs: ['CSCP Foundation'], salary: 8000 },
    { year: 2, level: 'Mid-Level', certs: ['CPIM', 'CIPS L4'], salary: 15000 },
    { year: 5, level: 'Senior', certs: ['CSCP', 'CIPS L5', 'PMP'], salary: 35000 },
    { year: 8, level: 'Manager', certs: ['CIPS L6', 'Six Sigma'], salary: 55000 },
    { year: 12, level: 'Director', certs: ['MCIPS', 'MBA'], salary: 80000 },
    { year: 15, level: 'Executive', certs: ['Board Certifications'], salary: 120000 },
  ];

  return {
    ...animationConfig.default,
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const data = milestones[params[0].dataIndex];
        return `
          <div style="min-width: 200px;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">${data.level}</div>
            <div style="color: ${colors.textSecondary}; font-size: 11px; margin-bottom: 8px;">Year ${data.year}</div>
            <div style="font-size: 20px; font-weight: 700; color: ${colors.primary[0]}; margin-bottom: 8px;">
              ${formatCurrency(data.salary)}/month
            </div>
            <div style="border-top: 1px solid ${colors.axisLine}; padding-top: 8px;">
              <div style="color: ${colors.textSecondary}; font-size: 11px; margin-bottom: 4px;">Recommended Certifications</div>
              ${data.certs.map(c => `<div style="font-size: 12px;">• ${c}</div>`).join('')}
            </div>
          </div>
        `;
      },
    },
    grid: {
      left: 80,
      right: 40,
      top: 60,
      bottom: 60,
    },
    xAxis: {
      type: 'category',
      data: milestones.map(m => `Year ${m.year}`),
      axisLabel: { color: colors.textSecondary },
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
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 12,
        lineStyle: {
          width: 4,
          color: createGradient(colors.primary[0], colors.primary[1], 'horizontal'),
        },
        itemStyle: {
          color: colors.primary[0],
          borderColor: isDark ? '#1F2937' : '#FFFFFF',
          borderWidth: 3,
        },
        areaStyle: {
          color: createGradient(
            hexToRgba(colors.primary[0], 0.3),
            hexToRgba(colors.primary[0], 0.05)
          ),
        },
        data: milestones.map(m => m.salary),
        label: {
          show: true,
          position: 'top',
          color: colors.textPrimary,
          fontSize: 11,
          fontWeight: 600,
          formatter: (params: any) => milestones[params.dataIndex].level,
        },
      },
    ],
  };
}

// Chart 29: Certification ROI (Bubble)
export function createCertificationROIConfig(
  certifications: Certification[],
  isDark: boolean
): EChartsOption {
  const colors = getChartColors(isDark);
  
  // Generate ROI data
  const data = certifications.slice(0, 15).map((cert, i) => ({
    name: cert.name,
    value: [
      cert.cost || Math.floor(Math.random() * 30000) + 5000, // Cost
      Math.floor(Math.random() * 40) + 10, // Salary increase %
      cert.durationMonths || Math.floor(Math.random() * 12) + 3, // Duration
    ],
    cert: cert,
    itemStyle: {
      color: hexToRgba(colors.primary[i % colors.primary.length], 0.7),
    },
  }));

  return {
    ...animationConfig.default,
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const [cost, salaryIncrease, duration] = params.data.value;
        const cert = params.data.cert as Certification;
        return `
          <div style="min-width: 220px;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">${cert.name}</div>
            <div style="color: ${colors.textSecondary}; font-size: 11px; margin-bottom: 8px;">${cert.provider}</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <div style="color: ${colors.textSecondary}; font-size: 11px;">Cost</div>
                <div style="font-weight: 600;">${formatCurrency(cost)}</div>
              </div>
              <div>
                <div style="color: ${colors.textSecondary}; font-size: 11px;">Duration</div>
                <div style="font-weight: 600;">${duration} months</div>
              </div>
              <div style="grid-column: span 2;">
                <div style="color: ${colors.textSecondary}; font-size: 11px;">Salary Increase</div>
                <div style="font-size: 20px; font-weight: 700; color: ${colors.positive};">+${salaryIncrease}%</div>
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
      bottom: 60,
    },
    xAxis: {
      type: 'value',
      name: 'Cost (AED)',
      nameLocation: 'middle',
      nameGap: 40,
      nameTextStyle: { color: colors.textSecondary },
      axisLabel: {
        color: colors.textSecondary,
        formatter: (val: number) => formatNumber(val, true),
      },
      splitLine: { lineStyle: { color: colors.splitLine, type: 'dashed' } },
    },
    yAxis: {
      type: 'value',
      name: 'Salary Increase (%)',
      nameTextStyle: { color: colors.textSecondary },
      axisLabel: { color: colors.textSecondary },
      splitLine: { lineStyle: { color: colors.splitLine, type: 'dashed' } },
    },
    series: [
      {
        type: 'scatter',
        symbolSize: (data: number[]) => Math.max(20, data[2] * 4),
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowColor: hexToRgba(colors.primary[0], 0.5),
          },
        },
        label: {
          show: true,
          position: 'right',
          color: colors.textSecondary,
          fontSize: 9,
          formatter: (params: any) => {
            const name = params.data.name;
            return name.length > 12 ? name.slice(0, 12) + '...' : name;
          },
        },
      },
    ],
  };
}

// Chart 30: Role-Certification Matrix
export function createRoleCertMatrixConfig(
  certifications: Certification[],
  roles: Role[],
  isDark: boolean
): EChartsOption {
  const colors = getChartColors(isDark);
  
  // Sample roles and certifications
  const roleNames = [
    'Supply Chain Manager',
    'Procurement Manager',
    'Logistics Coordinator',
    'Warehouse Supervisor',
    'Transport Manager',
    'Trade Compliance',
  ];
  
  const certNames = certifications.slice(0, 8).map(c => c.name);
  
  // Generate matrix data with original value preserved
  const data: { value: [number, number]; originalValue: number; itemStyle: any; symbol: string }[] = [];
  roleNames.forEach((_, ri) => {
    certNames.forEach((_, ci) => {
      // 0 = not recommended, 1 = optional, 2 = recommended
      const value = Math.random() > 0.6 ? (Math.random() > 0.5 ? 2 : 1) : 0;
      if (value > 0) {
        data.push({
          value: [ci, ri],
          originalValue: value,
          itemStyle: {
            color: value === 2 ? colors.positive : colors.primary[3],
          },
          symbol: value === 2 ? 'circle' : 'diamond',
        });
      }
    });
  });

  return {
    ...animationConfig.default,
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const [ci, ri] = params.data.value;
        const originalValue = params.data.originalValue;
        const status = originalValue === 2 ? 'Recommended' : 'Optional';
        const statusColor = originalValue === 2 ? colors.positive : colors.primary[3];
        return `
          <div>
            <div style="font-weight: 600; margin-bottom: 4px;">${roleNames[ri]}</div>
            <div style="color: ${colors.textSecondary}; font-size: 11px; margin-bottom: 8px;">${certNames[ci]}</div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: ${statusColor};"></span>
              <span style="font-weight: 500;">${status}</span>
            </div>
          </div>
        `;
      },
    },
    grid: {
      left: 160,
      right: 20,
      top: 100,
      bottom: 20,
    },
    xAxis: {
      type: 'category',
      data: certNames,
      position: 'top',
      axisLabel: {
        color: colors.textSecondary,
        fontSize: 10,
        rotate: 45,
        interval: 0,
      },
      axisTick: { show: false },
      axisLine: { show: false },
    },
    yAxis: {
      type: 'category',
      data: roleNames,
      axisLabel: {
        color: colors.textSecondary,
        fontSize: 11,
      },
      axisTick: { show: false },
      axisLine: { show: false },
    },
    series: [
      {
        type: 'scatter',
        symbolSize: 24,
        data: data,
      },
    ],
  };
}
