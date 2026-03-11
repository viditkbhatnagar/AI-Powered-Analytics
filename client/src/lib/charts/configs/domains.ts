/**
 * Domain Chart Configurations
 * Charts 9-16: Domain Hierarchy, Sub-Domain Distribution, Role Distribution, etc.
 */

import type { EChartsOption } from 'echarts';
import type { Domain, Company, Role } from '@shared/schema';
import { getChartColors, animationConfig } from '../theme';
import { hexToRgba, createGradient, sortByKey, topN } from '../utils';

interface DomainWithStats extends Domain {
  subdomainCount?: number;
  roleCount?: number;
  companies?: string[];
}

// Chart 9: Domain Hierarchy (Treemap)
export function createDomainHierarchyConfig(
  domains: DomainWithStats[],
  isDark: boolean
): EChartsOption {
  const colors = getChartColors(isDark);
  
  const data = domains.map((domain, index) => ({
    name: domain.name,
    value: domain.roleCount || 10,
    itemStyle: {
      color: colors.primary[index % colors.primary.length],
      borderColor: isDark ? '#1F2937' : '#FFFFFF',
      borderWidth: 2,
    },
    domain: domain,
  }));

  return {
    ...animationConfig.default,
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (!params.data || !params.data.domain) {
          return `<div style="font-weight: 600;">${params.name || 'Unknown'}</div>`;
        }
        const domain = params.data.domain as DomainWithStats;
        return `
          <div style="min-width: 200px;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">${domain.name}</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <div style="color: ${colors.textSecondary}; font-size: 11px;">Roles</div>
                <div style="font-size: 18px; font-weight: 700; color: ${colors.primary[0]};">${domain.roleCount || 0}</div>
              </div>
              <div>
                <div style="color: ${colors.textSecondary}; font-size: 11px;">Sub-domains</div>
                <div style="font-size: 18px; font-weight: 700; color: ${colors.primary[1]};">${domain.subdomainCount || 0}</div>
              </div>
            </div>
            ${domain.companies && domain.companies.length > 0 ? `
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid ${colors.axisLine};">
                <div style="color: ${colors.textSecondary}; font-size: 11px; margin-bottom: 4px;">Top Companies</div>
                <div style="font-size: 12px;">${domain.companies.slice(0, 3).join(', ')}</div>
              </div>
            ` : ''}
          </div>
        `;
      },
    },
    series: [
      {
        type: 'treemap',
        roam: false,
        nodeClick: 'zoomToNode',
        breadcrumb: {
          show: true,
          top: 8,
          left: 'center',
          itemStyle: {
            color: colors.splitLine,
            borderColor: colors.axisLine,
            textStyle: { color: colors.textPrimary },
          },
        },
        label: {
          show: true,
          formatter: '{b}',
          color: '#FFFFFF',
          fontSize: 12,
          fontWeight: 600,
          textShadowColor: 'rgba(0,0,0,0.3)',
          textShadowBlur: 4,
        },
        upperLabel: {
          show: true,
          height: 30,
          color: colors.textPrimary,
        },
        itemStyle: {
          borderRadius: 6,
          gapWidth: 3,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowColor: hexToRgba(colors.primary[0], 0.3),
          },
        },
        data: data,
      },
    ],
  };
}

// Chart 10: Sub-Domain Distribution (Sunburst)
export function createSubDomainDistributionConfig(
  domains: DomainWithStats[],
  isDark: boolean
): EChartsOption {
  const colors = getChartColors(isDark);
  
  // Create hierarchical data
  const data = [{
    name: 'Supply Chain',
    itemStyle: { color: colors.primary[0] },
    children: domains.map((domain, index) => ({
      name: domain.name,
      value: domain.subdomainCount || 1,
      itemStyle: { color: colors.primary[index % colors.primary.length] },
      children: Array.from({ length: domain.subdomainCount || 1 }, (_, i) => ({
        name: `${domain.name.split(' ')[0]} Sub-${i + 1}`,
        value: Math.floor((domain.roleCount || 10) / (domain.subdomainCount || 1)),
        itemStyle: { 
          color: hexToRgba(colors.primary[index % colors.primary.length], 0.7 - i * 0.1) 
        },
      })),
    })),
  }];

  return {
    ...animationConfig.default,
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const { name, value, treePathInfo } = params;
        const path = treePathInfo.map((p: any) => p.name).filter(Boolean);
        return `
          <div>
            <div style="color: ${colors.textSecondary}; font-size: 11px; margin-bottom: 4px;">
              ${path.slice(0, -1).join(' → ')}
            </div>
            <div style="font-weight: 600; font-size: 14px;">${name}</div>
            ${value ? `<div style="font-size: 18px; font-weight: 700; color: ${colors.primary[0]}; margin-top: 4px;">${value} roles</div>` : ''}
          </div>
        `;
      },
    },
    series: [
      {
        type: 'sunburst',
        radius: ['18%', '85%'],
        sort: undefined,
        emphasis: {
          focus: 'ancestor',
        },
        data: data,
        label: {
          show: false,
        },
        itemStyle: {
          borderRadius: 4,
          borderWidth: 2,
          borderColor: isDark ? '#1F2937' : '#FFFFFF',
        },
        levels: [
          {},
          {
            r0: '18%',
            r: '40%',
            label: { 
              show: false,
            },
          },
          {
            r0: '40%',
            r: '65%',
            label: { 
              show: false,
            },
          },
          {
            r0: '65%',
            r: '85%',
            label: { 
              show: false,
            },
          },
        ],
      },
    ],
  };
}

// Chart 11: Role Distribution (Horizontal Bar)
export function createRoleDistributionConfig(
  domains: DomainWithStats[],
  isDark: boolean
): EChartsOption {
  const colors = getChartColors(isDark);
  
  // Sort by role count descending
  const sorted = sortByKey(domains, 'roleCount' as keyof DomainWithStats, true);

  return {
    ...animationConfig.staggered,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const data = params[0];
        return `
          <div>
            <div style="font-weight: 600; margin-bottom: 4px;">${data.name}</div>
            <div style="font-size: 20px; font-weight: 700; color: ${colors.primary[0]};">${data.value} roles</div>
          </div>
        `;
      },
    },
    grid: {
      left: 180,
      right: 40,
      top: 20,
      bottom: 20,
    },
    xAxis: {
      type: 'value',
      axisLabel: { color: colors.textSecondary },
      splitLine: { lineStyle: { color: colors.splitLine, type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: sorted.map(d => d.name),
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
        barWidth: 16,
        itemStyle: {
          color: (params: any) => createGradient(
            colors.primary[params.dataIndex % colors.primary.length],
            hexToRgba(colors.primary[params.dataIndex % colors.primary.length], 0.6),
            'horizontal'
          ),
          borderRadius: [0, 4, 4, 0],
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: hexToRgba(colors.primary[0], 0.3),
          },
        },
        data: sorted.map(d => d.roleCount || 0),
        label: {
          show: true,
          position: 'right',
          color: colors.textSecondary,
          fontSize: 11,
          fontWeight: 600,
        },
      },
    ],
  };
}

// Chart 12: Company Network (Force-directed graph)
export function createCompanyNetworkConfig(
  domains: DomainWithStats[],
  companies: Company[],
  isDark: boolean
): EChartsOption {
  const colors = getChartColors(isDark);
  
  // Build nodes
  const domainNodes = domains.slice(0, 10).map((d, i) => ({
    id: `domain-${d.id}`,
    name: d.name,
    category: 0,
    symbolSize: 40,
    itemStyle: { color: colors.primary[i % colors.primary.length] },
  }));
  
  const companyNodes = companies.slice(0, 15).map((c, i) => ({
    id: `company-${c.id}`,
    name: c.name,
    category: 1,
    symbolSize: 25,
    itemStyle: { color: hexToRgba(colors.primary[i % colors.primary.length], 0.7) },
  }));
  
  // Build links (simplified - connect companies to random domains)
  const links = companyNodes.map((company, i) => ({
    source: company.id,
    target: domainNodes[i % domainNodes.length].id,
    lineStyle: { 
      color: hexToRgba(colors.textSecondary, 0.3),
      curveness: 0.2,
    },
  }));

  return {
    ...animationConfig.default,
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.dataType === 'node') {
          const isCompany = params.data.category === 1;
          return `
            <div>
              <div style="color: ${colors.textSecondary}; font-size: 11px;">${isCompany ? 'Company' : 'Domain'}</div>
              <div style="font-weight: 600; font-size: 14px;">${params.data.name}</div>
            </div>
          `;
        }
        return '';
      },
    },
    legend: {
      data: ['Domains', 'Companies'],
      top: 8,
      textStyle: { color: colors.textSecondary },
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        roam: true,
        draggable: true,
        categories: [
          { name: 'Domains' },
          { name: 'Companies' },
        ],
        data: [...domainNodes, ...companyNodes],
        links: links,
        force: {
          repulsion: 300,
          gravity: 0.1,
          edgeLength: [100, 200],
          friction: 0.6,
        },
        label: {
          show: true,
          position: 'right',
          color: colors.textPrimary,
          fontSize: 10,
          formatter: (params: any) => {
            const name = params.data.name;
            return name.length > 15 ? name.slice(0, 15) + '...' : name;
          },
        },
        lineStyle: {
          width: 1.5,
          opacity: 0.6,
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: { width: 3 },
        },
      },
    ],
  };
}

// Chart 13: Domain Interconnections (Chord diagram)
export function createDomainInterconnectionsConfig(
  domains: DomainWithStats[],
  isDark: boolean
): EChartsOption {
  const colors = getChartColors(isDark);
  
  const topDomains = domains.slice(0, 8);
  
  // Create circular layout graph
  const nodes = topDomains.map((d, i) => ({
    name: d.name,
    symbolSize: 30 + (d.roleCount || 10) / 2,
    itemStyle: { color: colors.primary[i % colors.primary.length] },
  }));
  
  // Create links between related domains
  const links: { source: string; target: string; value: number }[] = [];
  for (let i = 0; i < topDomains.length; i++) {
    for (let j = i + 1; j < topDomains.length; j++) {
      // Simulate relationship strength
      if (Math.random() > 0.5) {
        links.push({
          source: topDomains[i].name,
          target: topDomains[j].name,
          value: Math.floor(Math.random() * 10) + 1,
        });
      }
    }
  }

  return {
    ...animationConfig.default,
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.dataType === 'edge') {
          return `${params.data.source} ↔ ${params.data.target}<br/>Shared roles: ${params.data.value}`;
        }
        return `<div style="font-weight: 600;">${params.data.name}</div>`;
      },
    },
    series: [
      {
        type: 'graph',
        layout: 'circular',
        circular: {
          rotateLabel: true,
        },
        roam: true,
        data: nodes,
        links: links,
        label: {
          show: true,
          color: colors.textPrimary,
          fontSize: 11,
        },
        lineStyle: {
          color: 'source',
          curveness: 0.3,
          opacity: 0.5,
          width: 2,
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: { width: 4, opacity: 0.8 },
        },
      },
    ],
  };
}

// Chart 14: Job Role Hierarchy (Tree/Org chart)
export function createJobRoleHierarchyConfig(
  roles: Role[],
  isDark: boolean
): EChartsOption {
  const colors = getChartColors(isDark);
  
  // Build hierarchy by level
  const hierarchy = {
    name: 'Supply Chain Roles',
    itemStyle: { color: colors.primary[0] },
    children: [
      {
        name: 'Executive',
        itemStyle: { color: colors.primary[1] },
        children: [
          { name: 'CPO', value: 1 },
          { name: 'VP Supply Chain', value: 1 },
          { name: 'Director', value: 1 },
        ],
      },
      {
        name: 'Senior',
        itemStyle: { color: colors.primary[2] },
        children: [
          { name: 'Senior Manager', value: 1 },
          { name: 'Head of Operations', value: 1 },
          { name: 'Principal Analyst', value: 1 },
        ],
      },
      {
        name: 'Mid-Level',
        itemStyle: { color: colors.primary[3] },
        children: [
          { name: 'Manager', value: 1 },
          { name: 'Team Lead', value: 1 },
          { name: 'Senior Specialist', value: 1 },
        ],
      },
      {
        name: 'Entry',
        itemStyle: { color: colors.primary[4] },
        children: [
          { name: 'Coordinator', value: 1 },
          { name: 'Analyst', value: 1 },
          { name: 'Associate', value: 1 },
        ],
      },
    ],
  };

  return {
    ...animationConfig.default,
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => `<div style="font-weight: 600;">${params.data.name}</div>`,
    },
    series: [
      {
        type: 'tree',
        data: [hierarchy],
        layout: 'orthogonal',
        orient: 'TB',
        symbol: 'roundRect',
        symbolSize: [80, 30],
        roam: true,
        initialTreeDepth: 3,
        label: {
          position: 'inside',
          color: '#FFFFFF',
          fontSize: 10,
          fontWeight: 500,
        },
        leaves: {
          label: {
            position: 'inside',
            color: '#FFFFFF',
          },
        },
        lineStyle: {
          color: colors.axisLine,
          width: 2,
          curveness: 0.5,
        },
        emphasis: {
          focus: 'descendant',
        },
        expandAndCollapse: true,
        animationDuration: 550,
        animationDurationUpdate: 750,
      },
    ],
  };
}

// Chart 15: Domain Complexity (Radar)
export function createDomainComplexityConfig(
  domains: DomainWithStats[],
  isDark: boolean
): EChartsOption {
  const colors = getChartColors(isDark);
  
  const topDomains = domains.slice(0, 5);
  const indicators = [
    { name: 'Sub-domains', max: 10 },
    { name: 'Roles', max: 50 },
    { name: 'Companies', max: 20 },
    { name: 'Salary Range', max: 100 },
    { name: 'Certifications', max: 15 },
  ];

  const seriesData = topDomains.map((domain, index) => ({
    name: domain.name,
    value: [
      domain.subdomainCount || 3,
      domain.roleCount || 15,
      domain.companies?.length || 5,
      Math.floor(Math.random() * 60) + 40, // Simulated salary range score
      Math.floor(Math.random() * 10) + 5, // Simulated cert count
    ],
    areaStyle: {
      color: hexToRgba(colors.primary[index], 0.2),
    },
    lineStyle: {
      color: colors.primary[index],
      width: 2,
    },
    itemStyle: {
      color: colors.primary[index],
    },
  }));

  return {
    ...animationConfig.default,
    tooltip: {
      trigger: 'item',
    },
    legend: {
      data: topDomains.map(d => d.name),
      top: 8,
      textStyle: { color: colors.textSecondary, fontSize: 11 },
    },
    radar: {
      indicator: indicators,
      shape: 'polygon',
      splitNumber: 5,
      axisName: {
        color: colors.textSecondary,
        fontSize: 11,
      },
      splitLine: {
        lineStyle: { color: colors.splitLine },
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: [
            hexToRgba(colors.splitLine, 0.3),
            hexToRgba(colors.splitLine, 0.1),
          ],
        },
      },
      axisLine: {
        lineStyle: { color: colors.axisLine },
      },
    },
    series: [
      {
        type: 'radar',
        data: seriesData,
        emphasis: {
          lineStyle: { width: 4 },
        },
      },
    ],
  };
}

// Chart 16: Companies by Domain (Grouped Bar)
export function createCompaniesByDomainConfig(
  domains: DomainWithStats[],
  isDark: boolean
): EChartsOption {
  const colors = getChartColors(isDark);
  
  const topDomains = topN(domains, 10, 'roleCount' as keyof DomainWithStats);

  return {
    ...animationConfig.staggered,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    legend: {
      data: ['Companies', 'Roles'],
      top: 8,
      textStyle: { color: colors.textSecondary },
    },
    grid: {
      left: 20,
      right: 20,
      top: 60,
      bottom: 80,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: topDomains.map(d => d.name),
      axisLabel: {
        color: colors.textSecondary,
        fontSize: 10,
        rotate: 45,
        interval: 0,
      },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: colors.axisLine } },
    },
    yAxis: [
      {
        type: 'value',
        name: 'Companies',
        nameTextStyle: { color: colors.textSecondary },
        axisLabel: { color: colors.textSecondary },
        splitLine: { lineStyle: { color: colors.splitLine, type: 'dashed' } },
      },
      {
        type: 'value',
        name: 'Roles',
        nameTextStyle: { color: colors.textSecondary },
        axisLabel: { color: colors.textSecondary },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: 'Companies',
        type: 'bar',
        barWidth: 20,
        itemStyle: {
          color: createGradient(colors.primary[0], hexToRgba(colors.primary[0], 0.6)),
          borderRadius: [4, 4, 0, 0],
        },
        data: topDomains.map(d => d.companies?.length || 0),
      },
      {
        name: 'Roles',
        type: 'bar',
        yAxisIndex: 1,
        barWidth: 20,
        itemStyle: {
          color: createGradient(colors.primary[1], hexToRgba(colors.primary[1], 0.6)),
          borderRadius: [4, 4, 0, 0],
        },
        data: topDomains.map(d => d.roleCount || 0),
      },
    ],
  };
}
