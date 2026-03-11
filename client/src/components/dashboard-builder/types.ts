/**
 * Dashboard Builder Types
 * Tableau-level dashboard configuration types
 */

export type DataSourceType = 'initiatives' | 'domains' | 'salaries' | 'certifications' | 'companies' | 'roles';

export type AggregationType = 'none' | 'count' | 'sum' | 'avg' | 'min' | 'max';

export type ChartType = 
  | 'bar' 
  | 'line' 
  | 'pie' 
  | 'donut'
  | 'area' 
  | 'scatter' 
  | 'heatmap' 
  | 'treemap' 
  | 'sunburst'
  | 'radar'
  | 'gauge'
  | 'funnel'
  | 'boxplot';

export interface FieldConfig {
  field: string;
  label: string;
  aggregation: AggregationType;
}

export interface ChartFilter {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'between';
  value: string | number | [number, number];
}

export interface WidgetLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export interface DashboardWidget {
  id: string;
  type: ChartType;
  title: string;
  dataSource: DataSourceType;
  // Data binding
  xAxis?: FieldConfig;
  yAxis?: FieldConfig;
  groupBy?: string;
  colorField?: string;
  sizeField?: string;
  // Filters
  filters: ChartFilter[];
  // Styling
  colorScheme: string;
  showLegend: boolean;
  showLabels: boolean;
  // Layout managed by react-grid-layout
}

export interface DashboardState {
  id?: number;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layouts: WidgetLayout[];
  globalFilters: ChartFilter[];
  colorScheme: string;
  gridCols: number;
  rowHeight: number;
}

// Data field definitions for each data source
export interface DataField {
  id: string;
  label: string;
  type: 'string' | 'number' | 'date';
  aggregatable: boolean;
}

export const DATA_FIELDS: Record<DataSourceType, DataField[]> = {
  initiatives: [
    { id: 'name', label: 'Initiative Name', type: 'string', aggregatable: false },
    { id: 'scope', label: 'Scope (Emirate)', type: 'string', aggregatable: false },
    { id: 'category', label: 'Category', type: 'string', aggregatable: false },
    { id: 'startYear', label: 'Start Year', type: 'number', aggregatable: true },
    { id: 'endYear', label: 'End Year', type: 'number', aggregatable: true },
    { id: 'kpiTarget', label: 'KPI Target', type: 'number', aggregatable: true },
    { id: 'count', label: 'Count', type: 'number', aggregatable: true },
  ],
  domains: [
    { id: 'name', label: 'Domain Name', type: 'string', aggregatable: false },
    { id: 'description', label: 'Description', type: 'string', aggregatable: false },
    { id: 'roleCount', label: 'Role Count', type: 'number', aggregatable: true },
    { id: 'subdomainCount', label: 'Subdomain Count', type: 'number', aggregatable: true },
    { id: 'count', label: 'Count', type: 'number', aggregatable: true },
  ],
  salaries: [
    { id: 'level', label: 'Role Level', type: 'string', aggregatable: false },
    { id: 'domainId', label: 'Domain', type: 'string', aggregatable: false },
    { id: 'minSalary', label: 'Min Salary', type: 'number', aggregatable: true },
    { id: 'maxSalary', label: 'Max Salary', type: 'number', aggregatable: true },
    { id: 'avgSalary', label: 'Avg Salary', type: 'number', aggregatable: true },
    { id: 'count', label: 'Count', type: 'number', aggregatable: true },
  ],
  certifications: [
    { id: 'name', label: 'Certification Name', type: 'string', aggregatable: false },
    { id: 'provider', label: 'Provider', type: 'string', aggregatable: false },
    { id: 'level', label: 'Level', type: 'string', aggregatable: false },
    { id: 'cost', label: 'Cost (AED)', type: 'number', aggregatable: true },
    { id: 'durationMonths', label: 'Duration (Months)', type: 'number', aggregatable: true },
    { id: 'count', label: 'Count', type: 'number', aggregatable: true },
  ],
  companies: [
    { id: 'name', label: 'Company Name', type: 'string', aggregatable: false },
    { id: 'type', label: 'Company Type', type: 'string', aggregatable: false },
    { id: 'headquarters', label: 'Headquarters', type: 'string', aggregatable: false },
    { id: 'employeeCount', label: 'Employee Count', type: 'number', aggregatable: true },
    { id: 'count', label: 'Count', type: 'number', aggregatable: true },
  ],
  roles: [
    { id: 'title', label: 'Role Title', type: 'string', aggregatable: false },
    { id: 'level', label: 'Level', type: 'string', aggregatable: false },
    { id: 'domainId', label: 'Domain', type: 'string', aggregatable: false },
    { id: 'count', label: 'Count', type: 'number', aggregatable: true },
  ],
};

export const CHART_TYPES: { id: ChartType; label: string; icon: string; requiresXY: boolean }[] = [
  { id: 'bar', label: 'Bar Chart', icon: 'BarChart3', requiresXY: true },
  { id: 'line', label: 'Line Chart', icon: 'LineChart', requiresXY: true },
  { id: 'area', label: 'Area Chart', icon: 'Activity', requiresXY: true },
  { id: 'pie', label: 'Pie Chart', icon: 'PieChart', requiresXY: false },
  { id: 'donut', label: 'Donut Chart', icon: 'PieChart', requiresXY: false },
  { id: 'scatter', label: 'Scatter Plot', icon: 'Circle', requiresXY: true },
  { id: 'radar', label: 'Radar Chart', icon: 'Radar', requiresXY: false },
  { id: 'treemap', label: 'Treemap', icon: 'LayoutGrid', requiresXY: false },
  { id: 'funnel', label: 'Funnel', icon: 'Filter', requiresXY: false },
  { id: 'gauge', label: 'Gauge', icon: 'Gauge', requiresXY: false },
  { id: 'heatmap', label: 'Heatmap', icon: 'Grid3X3', requiresXY: true },
  { id: 'boxplot', label: 'Box Plot', icon: 'BoxSelect', requiresXY: true },
];

export const COLOR_SCHEMES = [
  { id: 'uae-blue', label: 'UAE Blue', colors: ['#0066CC', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'] },
  { id: 'emerald', label: 'Emerald', colors: ['#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0'] },
  { id: 'amber', label: 'Amber', colors: ['#D97706', '#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A'] },
  { id: 'rose', label: 'Rose', colors: ['#E11D48', '#F43F5E', '#FB7185', '#FDA4AF', '#FECDD3'] },
  { id: 'violet', label: 'Violet', colors: ['#7C3AED', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'] },
  { id: 'cyan', label: 'Cyan', colors: ['#0891B2', '#06B6D4', '#22D3EE', '#67E8F9', '#A5F3FC'] },
  { id: 'slate', label: 'Slate', colors: ['#475569', '#64748B', '#94A3B8', '#CBD5E1', '#E2E8F0'] },
  { id: 'multi', label: 'Multi-Color', colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'] },
];

export const AGGREGATIONS: { id: AggregationType; label: string }[] = [
  { id: 'none', label: 'None (Raw)' },
  { id: 'count', label: 'Count' },
  { id: 'sum', label: 'Sum' },
  { id: 'avg', label: 'Average' },
  { id: 'min', label: 'Minimum' },
  { id: 'max', label: 'Maximum' },
];

/**
 * Get default field bindings for a data source
 * Returns sensible defaults for X (category) and Y (value) axes
 */
export function getDefaultFieldBindings(dataSource: DataSourceType): {
  xAxis: FieldConfig;
  yAxis: FieldConfig;
} {
  const fields = DATA_FIELDS[dataSource];
  
  // Find first string field for X-axis (category)
  const categoryField = fields.find(f => f.type === 'string') || fields[0];
  
  // Find first aggregatable numeric field for Y-axis (value)
  const valueField = fields.find(f => f.type === 'number' && f.aggregatable && f.id !== 'count') 
    || fields.find(f => f.id === 'count')
    || fields.find(f => f.type === 'number');
  
  return {
    xAxis: {
      field: categoryField?.id || 'name',
      label: categoryField?.label || 'Category',
      aggregation: 'none',
    },
    yAxis: {
      field: valueField?.id || 'count',
      label: valueField?.label || 'Count',
      aggregation: valueField?.aggregatable ? 'sum' : 'count',
    },
  };
}

/**
 * Chart configuration validation result
 */
export interface ChartValidationResult {
  isValid: boolean;
  errorType?: 'missing_x' | 'missing_y' | 'missing_both' | 'invalid_field' | 'incompatible_type';
  message?: string;
  suggestion?: string;
}

/**
 * Validate chart configuration and return helpful messages
 */
export function validateChartConfig(
  widget: { 
    type: ChartType; 
    dataSource: DataSourceType; 
    xAxis?: FieldConfig; 
    yAxis?: FieldConfig;
  }
): ChartValidationResult {
  const chartTypeInfo = CHART_TYPES.find(t => t.id === widget.type);
  const fields = DATA_FIELDS[widget.dataSource];
  
  // For charts that require X/Y axes
  if (chartTypeInfo?.requiresXY) {
    if (!widget.xAxis && !widget.yAxis) {
      return {
        isValid: false,
        errorType: 'missing_both',
        message: 'Chart needs data binding',
        suggestion: 'Drag a category field to X-axis and a numeric field to Y-axis',
      };
    }
    
    if (!widget.xAxis) {
      return {
        isValid: false,
        errorType: 'missing_x',
        message: 'Missing category field',
        suggestion: 'Drag a text field (like name or type) to the X-axis',
      };
    }
    
    if (!widget.yAxis) {
      return {
        isValid: false,
        errorType: 'missing_y',
        message: 'Missing value field',
        suggestion: 'Drag a numeric field to the Y-axis',
      };
    }
    
    // Validate that fields exist in the data source
    const xFieldExists = fields.some(f => f.id === widget.xAxis?.field);
    const yFieldExists = fields.some(f => f.id === widget.yAxis?.field) || widget.yAxis?.field === 'count';
    
    if (!xFieldExists) {
      return {
        isValid: false,
        errorType: 'invalid_field',
        message: `Field "${widget.xAxis?.label}" not found`,
        suggestion: `This field doesn't exist in ${widget.dataSource}. Choose a different field.`,
      };
    }
    
    if (!yFieldExists) {
      return {
        isValid: false,
        errorType: 'invalid_field',
        message: `Field "${widget.yAxis?.label}" not found`,
        suggestion: `This field doesn't exist in ${widget.dataSource}. Choose a different field.`,
      };
    }
  } else {
    // For pie, donut, funnel, etc. - need at least a grouping field
    if (!widget.xAxis) {
      return {
        isValid: false,
        errorType: 'missing_x',
        message: 'Missing grouping field',
        suggestion: 'Select a field to group data by (like category or type)',
      };
    }
    
    const xFieldExists = fields.some(f => f.id === widget.xAxis?.field);
    if (!xFieldExists) {
      return {
        isValid: false,
        errorType: 'invalid_field',
        message: `Field "${widget.xAxis?.label}" not found`,
        suggestion: `This field doesn't exist in ${widget.dataSource}. Choose a different field.`,
      };
    }
  }
  
  return { isValid: true };
}
