/**
 * Chart Configuration Panel
 * Right sidebar for configuring selected chart widget
 */

import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Circle,
  Radar,
  LayoutGrid,
  Filter,
  Gauge,
  Grid3X3,
  BoxSelect,
  Trash2,
  Copy,
  ArrowRight,
  Hash,
  Type,
} from 'lucide-react';
import {
  type DashboardWidget,
  type ChartType,
  type AggregationType,
  type DataSourceType,
  CHART_TYPES,
  COLOR_SCHEMES,
  AGGREGATIONS,
  DATA_FIELDS,
  getDefaultFieldBindings,
} from './types';
import { cn } from '@/lib/utils';

interface ChartConfigPanelProps {
  widget: DashboardWidget | null;
  onUpdateWidget: (updates: Partial<DashboardWidget>) => void;
  onDeleteWidget: () => void;
  onDuplicateWidget: () => void;
}

const CHART_ICONS: Record<ChartType, typeof BarChart3> = {
  bar: BarChart3,
  line: LineChart,
  pie: PieChart,
  donut: PieChart,
  area: Activity,
  scatter: Circle,
  radar: Radar,
  treemap: LayoutGrid,
  funnel: Filter,
  gauge: Gauge,
  heatmap: Grid3X3,
  boxplot: BoxSelect,
};

export function ChartConfigPanel({
  widget,
  onUpdateWidget,
  onDeleteWidget,
  onDuplicateWidget,
}: ChartConfigPanelProps) {
  const [dragOverAxis, setDragOverAxis] = useState<'x' | 'y' | null>(null);

  if (!widget) {
    return (
      <div className="flex h-full flex-col border-l border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Chart Configuration
          </h2>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            Select a chart to configure
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Or add a new chart from the toolbar
          </p>
        </div>
      </div>
    );
  }

  const chartTypeInfo = CHART_TYPES.find(t => t.id === widget.type);
  const fields = DATA_FIELDS[widget.dataSource] || [];

  const handleDrop = (e: React.DragEvent, axis: 'x' | 'y') => {
    e.preventDefault();
    setDragOverAxis(null);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      const { field, source } = data;
      
      // If data source is changing, set smart defaults for the other axis
      if (source !== widget.dataSource) {
        const defaults = getDefaultFieldBindings(source);
        
        if (axis === 'x') {
          // User dropped on X-axis, set smart default for Y
          onUpdateWidget({ 
            dataSource: source,
            xAxis: { field: field.id, label: field.label, aggregation: 'none' },
            yAxis: defaults.yAxis,
          });
        } else {
          // User dropped on Y-axis, set smart default for X
          onUpdateWidget({ 
            dataSource: source,
            xAxis: defaults.xAxis,
            yAxis: { field: field.id, label: field.label, aggregation: field.aggregatable ? 'sum' : 'count' },
          });
        }
      } else {
        // Same data source, just update the specific axis
        onUpdateWidget({
          [axis === 'x' ? 'xAxis' : 'yAxis']: {
            field: field.id,
            label: field.label,
            aggregation: axis === 'y' && field.aggregatable ? 'sum' : 'none',
          },
        });
      }
    } catch (err) {
      console.error('Failed to parse drag data:', err);
    }
  };

  const handleDragOver = (e: React.DragEvent, axis: 'x' | 'y') => {
    e.preventDefault();
    setDragOverAxis(axis);
  };

  const handleDragLeave = () => {
    setDragOverAxis(null);
  };

  return (
    <div className="flex h-full flex-col border-l border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Chart Configuration
        </h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-6 p-4">
          {/* Chart Title */}
          <div className="space-y-2">
            <Label htmlFor="chart-title">Chart Title</Label>
            <Input
              id="chart-title"
              value={widget.title}
              onChange={(e) => onUpdateWidget({ title: e.target.value })}
              placeholder="Enter chart title"
            />
          </div>

          {/* Chart Type */}
          <div className="space-y-2">
            <Label>Chart Type</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {CHART_TYPES.map((type) => {
                const Icon = CHART_ICONS[type.id];
                return (
                  <button
                    key={type.id}
                    onClick={() => onUpdateWidget({ type: type.id })}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border p-2 transition-colors",
                      "hover:bg-accent",
                      widget.type === type.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border"
                    )}
                    title={type.label}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[10px] leading-tight">{type.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Data Source */}
          <div className="space-y-2">
            <Label>Data Source</Label>
            <Select
              value={widget.dataSource}
              onValueChange={(value: DataSourceType) => {
                // When data source changes, set smart defaults instead of clearing
                const defaults = getDefaultFieldBindings(value);
                onUpdateWidget({ 
                  dataSource: value,
                  xAxis: defaults.xAxis,
                  yAxis: defaults.yAxis,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(DATA_FIELDS) as DataSourceType[]).map((source) => (
                  <SelectItem key={source} value={source}>
                    <span className="capitalize">{source}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Axis Configuration */}
          {chartTypeInfo?.requiresXY && (
            <>
              <div className="space-y-3">
                <Label>Data Binding</Label>
                
                {/* X Axis Drop Zone */}
                <div
                  onDrop={(e) => handleDrop(e, 'x')}
                  onDragOver={(e) => handleDragOver(e, 'x')}
                  onDragLeave={handleDragLeave}
                  className={cn(
                    "rounded-lg border-2 border-dashed p-3 transition-colors",
                    dragOverAxis === 'x'
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <ArrowRight className="h-3 w-3" />
                    <span className="font-medium">X-Axis (Category)</span>
                  </div>
                  {widget.xAxis ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Type className="h-3.5 w-3.5 text-green-500" />
                        <span className="text-sm font-medium">{widget.xAxis.label}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => onUpdateWidget({ xAxis: undefined })}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground/70">
                      Drag a field here
                    </p>
                  )}
                </div>

                {/* Y Axis Drop Zone */}
                <div
                  onDrop={(e) => handleDrop(e, 'y')}
                  onDragOver={(e) => handleDragOver(e, 'y')}
                  onDragLeave={handleDragLeave}
                  className={cn(
                    "rounded-lg border-2 border-dashed p-3 transition-colors",
                    dragOverAxis === 'y'
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <ArrowRight className="h-3 w-3 rotate-[-90deg]" />
                    <span className="font-medium">Y-Axis (Value)</span>
                  </div>
                  {widget.yAxis ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Hash className="h-3.5 w-3.5 text-blue-500" />
                          <span className="text-sm font-medium">{widget.yAxis.label}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => onUpdateWidget({ yAxis: undefined })}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <Select
                        value={widget.yAxis.aggregation}
                        onValueChange={(value: AggregationType) =>
                          onUpdateWidget({
                            yAxis: { ...widget.yAxis!, aggregation: value },
                          })
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Aggregation" />
                        </SelectTrigger>
                        <SelectContent>
                          {AGGREGATIONS.map((agg) => (
                            <SelectItem key={agg.id} value={agg.id}>
                              {agg.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground/70">
                      Drag a numeric field here
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* For non-XY charts, show simple field selector */}
          {!chartTypeInfo?.requiresXY && (
            <div className="space-y-3">
              <Label>Group By Field</Label>
              <Select
                value={widget.xAxis?.field || ''}
                onValueChange={(value) =>
                  onUpdateWidget({
                    xAxis: {
                      field: value,
                      label: fields.find(f => f.id === value)?.label || value,
                      aggregation: 'none',
                    },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {fields.filter(f => f.type === 'string').map((field) => (
                    <SelectItem key={field.id} value={field.id}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Label>Value Field</Label>
              <Select
                value={widget.yAxis?.field || 'count'}
                onValueChange={(value) =>
                  onUpdateWidget({
                    yAxis: {
                      field: value,
                      label: fields.find(f => f.id === value)?.label || 'Count',
                      aggregation: value === 'count' ? 'count' : 'sum',
                    },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="count">Count</SelectItem>
                  {fields.filter(f => f.aggregatable).map((field) => (
                    <SelectItem key={field.id} value={field.id}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Separator />

          {/* Color Scheme */}
          <div className="space-y-2">
            <Label>Color Scheme</Label>
            <div className="grid grid-cols-2 gap-2">
              {COLOR_SCHEMES.map((scheme) => (
                <button
                  key={scheme.id}
                  onClick={() => onUpdateWidget({ colorScheme: scheme.id })}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border p-2 transition-colors",
                    "hover:bg-accent",
                    widget.colorScheme === scheme.id
                      ? "border-primary bg-primary/10"
                      : "border-border"
                  )}
                >
                  <div className="flex gap-0.5">
                    {scheme.colors.slice(0, 3).map((color, i) => (
                      <div
                        key={i}
                        className="h-4 w-4 rounded-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="text-xs">{scheme.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Display Options */}
          <div className="space-y-4">
            <Label>Display Options</Label>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="show-legend" className="text-sm font-normal">
                Show Legend
              </Label>
              <Switch
                id="show-legend"
                checked={widget.showLegend}
                onCheckedChange={(checked) => onUpdateWidget({ showLegend: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-labels" className="text-sm font-normal">
                Show Labels
              </Label>
              <Switch
                id="show-labels"
                checked={widget.showLabels}
                onCheckedChange={(checked) => onUpdateWidget({ showLabels: checked })}
              />
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={onDuplicateWidget}
            >
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={onDeleteWidget}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
