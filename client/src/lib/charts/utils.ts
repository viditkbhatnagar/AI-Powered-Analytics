/**
 * Chart utility functions for data transformation and formatting
 */

import type { Initiative, Domain, Salary, Certification, Company, Role } from '@shared/schema';

// Number formatting
export function formatNumber(value: number, compact = false): string {
  if (compact) {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat('en-AE').format(value);
}

export function formatCurrency(value: number, currency = 'AED'): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

// Date formatting
export function formatYear(year: number): string {
  return year.toString();
}

export function formatYearRange(start: number, end: number): string {
  return `${start}–${end}`;
}

// Color utilities
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function createGradient(
  color1: string,
  color2: string,
  direction: 'vertical' | 'horizontal' = 'vertical'
) {
  return {
    type: 'linear' as const,
    x: 0,
    y: 0,
    x2: direction === 'horizontal' ? 1 : 0,
    y2: direction === 'vertical' ? 1 : 0,
    colorStops: [
      { offset: 0, color: color1 },
      { offset: 1, color: color2 },
    ],
  };
}

// Data transformation helpers
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

export function sortByKey<T>(array: T[], key: keyof T, desc = false): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return desc ? bVal - aVal : aVal - bVal;
    }
    return desc 
      ? String(bVal).localeCompare(String(aVal))
      : String(aVal).localeCompare(String(bVal));
  });
}

export function topN<T>(array: T[], n: number, key: keyof T): T[] {
  return sortByKey(array, key, true).slice(0, n);
}

// Initiative data transformations
export function getInitiativesByScope(initiatives: Initiative[]) {
  return groupBy(initiatives, 'scope');
}

export function getInitiativesByCategory(initiatives: Initiative[]) {
  return groupBy(initiatives, 'category');
}

export function getInitiativeTimeline(initiatives: Initiative[]) {
  return initiatives.map(init => ({
    name: init.name,
    scope: init.scope,
    start: init.timeframeStart,
    end: init.timeframeEnd,
    duration: init.timeframeEnd - init.timeframeStart,
    kpiTarget: init.kpiTarget,
    domainsImpacted: init.domainsImpacted,
    category: init.category,
  }));
}

// Domain data transformations
export function getDomainStats(domains: (Domain & { subdomainCount?: number; roleCount?: number; companies?: string[] })[]) {
  return domains.map(d => ({
    id: d.id,
    name: d.name,
    subdomainCount: d.subdomainCount || 0,
    roleCount: d.roleCount || 0,
    companyCount: d.companies?.length || 0,
  }));
}

// Salary data transformations
export function getSalaryByDomain(salaries: Salary[], domains: Domain[]) {
  const domainMap = new Map(domains.map(d => [d.id, d.name]));
  const grouped = groupBy(salaries, 'domainId');
  
  return Object.entries(grouped).map(([domainId, sals]) => {
    const minSalary = Math.min(...sals.map(s => s.minSalary));
    const maxSalary = Math.max(...sals.map(s => s.maxSalary));
    const avgSalary = sals.reduce((sum, s) => sum + (s.minSalary + s.maxSalary) / 2, 0) / sals.length;
    
    return {
      domainId: Number(domainId),
      domainName: domainMap.get(Number(domainId)) || `Domain ${domainId}`,
      minSalary,
      maxSalary,
      avgSalary: Math.round(avgSalary),
      count: sals.length,
    };
  });
}

export function getSalaryByLevel(salaries: Salary[]) {
  const levels = ['ENTRY', 'MID', 'SENIOR', 'EXECUTIVE'] as const;
  const grouped = groupBy(salaries, 'roleLevel');
  
  return levels.map(level => {
    const sals = grouped[level] || [];
    if (sals.length === 0) {
      return { level, minSalary: 0, maxSalary: 0, avgSalary: 0, count: 0 };
    }
    
    const minSalary = Math.min(...sals.map(s => s.minSalary));
    const maxSalary = Math.max(...sals.map(s => s.maxSalary));
    const avgSalary = sals.reduce((sum, s) => sum + (s.minSalary + s.maxSalary) / 2, 0) / sals.length;
    
    return {
      level,
      minSalary,
      maxSalary,
      avgSalary: Math.round(avgSalary),
      count: sals.length,
    };
  });
}

export function getSalaryHeatmapData(salaries: Salary[], domains: Domain[]) {
  const domainMap = new Map(domains.map(d => [d.id, d.name]));
  const levels = ['ENTRY', 'MID', 'SENIOR', 'EXECUTIVE'];
  const data: [number, number, number][] = [];
  
  const domainIds = [...new Set(salaries.map(s => s.domainId))];
  
  domainIds.forEach((domainId, yIndex) => {
    levels.forEach((level, xIndex) => {
      const sal = salaries.find(s => s.domainId === domainId && s.roleLevel === level);
      if (sal) {
        const avgSalary = (sal.minSalary + sal.maxSalary) / 2;
        data.push([xIndex, yIndex, avgSalary]);
      }
    });
  });
  
  return {
    data,
    xLabels: levels,
    yLabels: domainIds.map(id => domainMap.get(id) || `Domain ${id}`),
  };
}

// Certification data transformations
export function getCertificationsByProvider(certifications: Certification[]) {
  const grouped = groupBy(certifications, 'provider');
  return Object.entries(grouped).map(([provider, certs]) => ({
    provider,
    count: certs.length,
    avgCost: certs.reduce((sum, c) => sum + (c.cost || 0), 0) / certs.length,
    avgDuration: certs.reduce((sum, c) => sum + (c.durationMonths || 0), 0) / certs.length,
  }));
}

// Tooltip formatters
export function createTooltipFormatter(type: 'salary' | 'count' | 'percent' | 'currency') {
  return (params: { name: string; value: number; seriesName?: string }) => {
    const { name, value, seriesName } = params;
    let formattedValue: string;
    
    switch (type) {
      case 'salary':
        formattedValue = formatCurrency(value);
        break;
      case 'currency':
        formattedValue = formatCurrency(value);
        break;
      case 'percent':
        formattedValue = formatPercent(value, 1);
        break;
      default:
        formattedValue = formatNumber(value);
    }
    
    return `
      <div style="font-weight: 600; margin-bottom: 4px;">${name}</div>
      ${seriesName ? `<div style="color: #6B7280; font-size: 12px;">${seriesName}</div>` : ''}
      <div style="font-size: 18px; font-weight: 700; color: #2563EB;">${formattedValue}</div>
    `;
  };
}

// UAE Emirates data for maps
export const uaeEmirates = [
  { name: 'Dubai', code: 'DXB' },
  { name: 'Abu Dhabi', code: 'AUH' },
  { name: 'Sharjah', code: 'SHJ' },
  { name: 'Ajman', code: 'AJM' },
  { name: 'Umm Al Quwain', code: 'UAQ' },
  { name: 'Ras Al Khaimah', code: 'RAK' },
  { name: 'Fujairah', code: 'FUJ' },
];

// Scope to emirate mapping
export function mapScopeToEmirate(scope: string): string {
  const scopeLower = scope.toLowerCase();
  if (scopeLower.includes('dubai')) return 'Dubai';
  if (scopeLower.includes('abu dhabi')) return 'Abu Dhabi';
  if (scopeLower.includes('sharjah')) return 'Sharjah';
  if (scopeLower.includes('fujairah')) return 'Fujairah';
  if (scopeLower.includes('ajman')) return 'Ajman';
  if (scopeLower.includes('ras al khaimah')) return 'Ras Al Khaimah';
  if (scopeLower.includes('umm al quwain')) return 'Umm Al Quwain';
  return 'Federal'; // UAE-wide initiatives
}
