/**
 * Dashboard Canvas
 * Main canvas area with react-grid-layout for drag, drop, and resize
 */

import { useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  GripVertical,
  X,
  Maximize2,
  BarChart3,
  Settings2,
} from 'lucide-react';
import { WidgetChart, WidgetChartRef } from './widget-chart';
import type { DashboardWidget, WidgetLayout } from './types';
import { cn } from '@/lib/utils';

// Import react-grid-layout styles
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

interface DashboardCanvasProps {
  widgets: DashboardWidget[];
  layouts: WidgetLayout[];
  selectedWidgetId: string | null;
  onSelectWidget: (id: string | null) => void;
  onLayoutChange: (layouts: WidgetLayout[]) => void;
  onRemoveWidget: (id: string) => void;
  gridCols?: number;
  rowHeight?: number;
  containerWidth: number;
}

export interface DashboardCanvasRef {
  getChartDataURLs: () => Map<string, string>;
}

export const DashboardCanvas = forwardRef<DashboardCanvasRef, DashboardCanvasProps>(
  function DashboardCanvas({
  widgets,
  layouts,
  selectedWidgetId,
  onSelectWidget,
  onLayoutChange,
  onRemoveWidget,
  gridCols = 12,
  rowHeight = 80,
  containerWidth,
}, ref) {
  // Store refs to all chart widgets
  const chartRefs = useRef<Map<string, WidgetChartRef>>(new Map());

  // Expose method to get all chart data URLs
  useImperativeHandle(ref, () => ({
    getChartDataURLs: () => {
      const dataURLs = new Map<string, string>();
      chartRefs.current.forEach((chartRef, widgetId) => {
        const dataURL = chartRef.getDataURL();
        if (dataURL) {
          dataURLs.set(widgetId, dataURL);
        }
      });
      return dataURLs;
    },
  }));

  const handleLayoutChange = useCallback(
    (newLayout: Layout[]) => {
      const updatedLayouts: WidgetLayout[] = newLayout.map((item) => ({
        i: item.i,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        minW: item.minW,
        minH: item.minH,
      }));
      onLayoutChange(updatedLayouts);
    },
    [onLayoutChange]
  );

  if (widgets.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <BarChart3 className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Start Building Your Dashboard</h3>
          <p className="mt-2 text-muted-foreground">
            Click "Add Chart" in the toolbar to add your first visualization.
            Drag fields from the left panel to configure data bindings.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <GripVertical className="h-3 w-3" />
              Drag to move
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Maximize2 className="h-3 w-3" />
              Resize from corners
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Settings2 className="h-3 w-3" />
              Click to configure
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto p-4">
      <GridLayout
        className="layout"
        layout={layouts}
        cols={gridCols}
        rowHeight={rowHeight}
        width={containerWidth - 32} // Account for padding
        onLayoutChange={handleLayoutChange}
        draggableHandle=".drag-handle"
        resizeHandles={['se', 'sw', 'ne', 'nw', 'e', 'w', 's', 'n']}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        compactType="vertical"
        preventCollision={false}
        isResizable={true}
        isDraggable={true}
      >
        {widgets.map((widget) => {
          const layout = layouts.find((l) => l.i === widget.id);
          
          return (
            <div
              key={widget.id}
              data-grid={{
                ...layout,
                minW: 2,
                minH: 2,
              }}
            >
              <Card
                className={cn(
                  "h-full w-full overflow-hidden transition-shadow",
                  "hover:shadow-lg",
                  selectedWidgetId === widget.id && "ring-2 ring-primary shadow-lg"
                )}
                onClick={() => onSelectWidget(widget.id)}
              >
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 border-b bg-muted/30 px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="drag-handle cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-accent">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-sm font-medium truncate">
                      {widget.title}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {widget.type}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveWidget(widget.id);
                      }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-2 h-[calc(100%-44px)]">
                  <WidgetChart 
                    widget={widget} 
                    ref={(chartRef) => {
                      if (chartRef) {
                        chartRefs.current.set(widget.id, chartRef);
                      } else {
                        chartRefs.current.delete(widget.id);
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          );
        })}
      </GridLayout>
    </div>
  );
});
