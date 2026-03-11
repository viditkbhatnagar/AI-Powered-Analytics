/**
 * Dashboard Data Hook
 * Fetches and transforms data for dashboard widgets
 */

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { 
  DashboardWidget, 
  DataSourceType, 
  AggregationType,
  FieldConfig,
} from './types';
import type { Initiative, Domain, Salary, Certification, Company, Role } from '@shared/schema';

interface DataResult {
  labels: string[];
  values: number[];
  series?: { name: string; data: number[] }[];
  rawData?: Record<string, unknown>[];
}

// Fetch all data sources
export function useDashboardData() {
  const { data: initiatives, isLoading: loadingInitiatives } = useQuery<Initiative[]>({
    queryKey: ['/api/initiatives'],
  });

  const { data: domains, isLoading: loadingDomains } = useQuery<(Domain & { roleCount?: number; subdomainCount?: number })[]>({
    queryKey: ['/api/domains'],
  });

  const { data: salaries, isLoading: loadingSalaries } = useQuery<Salary[]>({
    queryKey: ['/api/salaries'],
  });

  const { data: certifications, isLoading: loadingCertifications } = useQuery<Certification[]>({
    queryKey: ['/api/certifications'],
  });

  const { data: companies, isLoading: loadingCompanies } = useQuery<Company[]>({
    queryKey: ['/api/companies'],
  });

  const { data: roles, isLoading: loadingRoles } = useQuery<Role[]>({
    queryKey: ['/api/roles'],
  });

  const isLoading = loadingInitiatives || loadingDomains || loadingSalaries || 
                    loadingCertifications || loadingCompanies || loadingRoles;

  return {
    initiatives: initiatives || [],
    domains: domains || [],
    salaries: salaries || [],
    certifications: certifications || [],
    companies: companies || [],
    roles: roles || [],
    isLoading,
  };
}

// Get raw data for a data source
export function getDataSource(
  dataSource: DataSourceType,
  data: ReturnType<typeof useDashboardData>
): Record<string, unknown>[] {
  switch (dataSource) {
    case 'initiatives':
      return data.initiatives as Record<string, unknown>[];
    case 'domains':
      return data.domains as Record<string, unknown>[];
    case 'salaries':
      // Add computed avgSalary
      return data.salaries.map(s => ({
        ...s,
        avgSalary: Math.round((s.minSalary + s.maxSalary) / 2),
      })) as Record<string, unknown>[];
    case 'certifications':
      return data.certifications as Record<string, unknown>[];
    case 'companies':
      return data.companies as Record<string, unknown>[];
    case 'roles':
      return data.roles as Record<string, unknown>[];
    default:
      return [];
  }
}

// Apply aggregation to values
function aggregate(values: number[], aggregation: AggregationType): number {
  if (values.length === 0) return 0;
  
  switch (aggregation) {
    case 'count':
      return values.length;
    case 'sum':
      return values.reduce((a, b) => a + b, 0);
    case 'avg':
      return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    case 'min':
      return Math.min(...values);
    case 'max':
      return Math.max(...values);
    case 'none':
    default:
      return values[0] || 0;
  }
}

// Transform data for chart rendering
export function transformDataForChart(
  widget: DashboardWidget,
  rawData: Record<string, unknown>[]
): DataResult {
  if (!rawData || rawData.length === 0) {
    return { labels: [], values: [], rawData: [] };
  }

  const { xAxis, yAxis, groupBy, type } = widget;

  // For pie/donut charts - group by a field and count or sum
  if (type === 'pie' || type === 'donut' || type === 'funnel' || type === 'treemap') {
    const groupField = xAxis?.field || groupBy || 'name';
    const valueField = yAxis?.field || 'count';
    const agg = yAxis?.aggregation || 'count';

    const groups = new Map<string, number[]>();
    
    rawData.forEach(item => {
      const rawKey = item[groupField];
      // Skip items with null/undefined keys
      if (rawKey === null || rawKey === undefined || rawKey === '') return;
      
      const key = String(rawKey);
      const value = valueField === 'count' ? 1 : Number(item[valueField]) || 0;
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(value);
    });

    // If no valid groups found, return empty
    if (groups.size === 0) {
      return { labels: [], values: [], rawData };
    }

    const labels: string[] = [];
    const values: number[] = [];

    groups.forEach((vals, key) => {
      labels.push(key);
      values.push(aggregate(vals, agg));
    });

    // Sort by value descending and take top 10
    const sorted = labels.map((l, i) => ({ label: l, value: values[i] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 12);

    return {
      labels: sorted.map(s => s.label),
      values: sorted.map(s => s.value),
      rawData,
    };
  }

  // For gauge - single value
  if (type === 'gauge') {
    const valueField = yAxis?.field || 'count';
    const agg = yAxis?.aggregation || 'avg';
    
    const values = rawData.map(item => 
      valueField === 'count' ? 1 : Number(item[valueField]) || 0
    );
    
    return {
      labels: [widget.title],
      values: [aggregate(values, agg)],
      rawData,
    };
  }

  // For radar - multiple dimensions
  if (type === 'radar') {
    const groupField = xAxis?.field || 'name';
    const groups = new Map<string, Record<string, number>>();
    
    // Get numeric fields
    const numericFields = Object.keys(rawData[0] || {}).filter(key => {
      const val = rawData[0][key];
      return typeof val === 'number' && key !== 'id';
    }).slice(0, 6);

    rawData.forEach(item => {
      const rawKey = item[groupField];
      if (rawKey === null || rawKey === undefined || rawKey === '') return;
      
      const key = String(rawKey);
      if (!groups.has(key)) {
        groups.set(key, {});
        numericFields.forEach(f => groups.get(key)![f] = 0);
      }
      numericFields.forEach(f => {
        groups.get(key)![f] += Number(item[f]) || 0;
      });
    });

    return {
      labels: numericFields,
      values: [],
      series: Array.from(groups.entries()).slice(0, 5).map(([name, data]) => ({
        name,
        data: numericFields.map(f => data[f]),
      })),
      rawData,
    };
  }

  // For bar/line/area/scatter - X and Y axis
  if (xAxis && yAxis) {
    const xField = xAxis.field;
    const yField = yAxis.field;
    const agg = yAxis.aggregation || 'sum';

    // Group by X axis
    const groups = new Map<string, number[]>();
    
    rawData.forEach(item => {
      const rawXValue = item[xField];
      // Skip items with null/undefined X values
      if (rawXValue === null || rawXValue === undefined || rawXValue === '') return;
      
      const xValue = String(rawXValue);
      const yValue = yField === 'count' ? 1 : Number(item[yField]) || 0;
      
      if (!groups.has(xValue)) {
        groups.set(xValue, []);
      }
      groups.get(xValue)!.push(yValue);
    });

    // If no valid groups found, return empty
    if (groups.size === 0) {
      return { labels: [], values: [], rawData };
    }

    const labels: string[] = [];
    const values: number[] = [];

    groups.forEach((vals, key) => {
      labels.push(key);
      values.push(aggregate(vals, agg));
    });

    return { labels, values, rawData };
  }

  // If we reach here without proper axis config, return empty to trigger validation message
  return { labels: [], values: [], rawData };
}

// Hook to get transformed data for a widget
export function useWidgetData(widget: DashboardWidget) {
  const allData = useDashboardData();
  
  return useMemo(() => {
    if (allData.isLoading) {
      return { data: null, isLoading: true };
    }
    
    const rawData = getDataSource(widget.dataSource, allData);
    const transformed = transformDataForChart(widget, rawData);
    
    return { data: transformed, isLoading: false };
  }, [widget, allData]);
}
