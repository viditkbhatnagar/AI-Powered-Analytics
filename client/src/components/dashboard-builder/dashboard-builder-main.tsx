/**
 * Dashboard Builder - Main Component
 * Tableau-level dashboard builder with drag-drop, resize, and real-time charts
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Save,
  FolderOpen,
  Trash2,
  Download,
  Plus,
  BarChart3,
  ChevronDown,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid3X3,
  FileJson,
  Image,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { DataFieldPanel } from './data-field-panel';
import { ChartConfigPanel } from './chart-config-panel';
import { DashboardCanvas, DashboardCanvasRef } from './dashboard-canvas';
import {
  type DashboardWidget,
  type DashboardState,
  type WidgetLayout,
  type DataSourceType,
  type ChartType,
  type DataField,
  CHART_TYPES,
  getDefaultFieldBindings,
} from './types';
import type { Dashboard, DashboardConfig } from '@shared/schema';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Get default bindings for the default data source
const defaultBindings = getDefaultFieldBindings('domains');

const DEFAULT_WIDGET: Omit<DashboardWidget, 'id'> = {
  type: 'bar',
  title: 'New Chart',
  dataSource: 'domains',
  xAxis: defaultBindings.xAxis,
  yAxis: defaultBindings.yAxis,
  filters: [],
  colorScheme: 'uae-blue',
  showLegend: true,
  showLabels: false,
};

export function DashboardBuilder() {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);
  const dashboardCanvasRef = useRef<DashboardCanvasRef>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  
  // Dashboard state
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    name: 'My Dashboard',
    description: '',
    widgets: [],
    layouts: [],
    globalFilters: [],
    colorScheme: 'uae-blue',
    gridCols: 12,
    rowHeight: 80,
  });
  
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [selectedDataSource, setSelectedDataSource] = useState<DataSourceType | null>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);

  // Fetch saved dashboards
  const { data: savedDashboards } = useQuery<Dashboard[]>({
    queryKey: ['/api/dashboards'],
  });

  // Save mutation (create new)
  const saveMutation = useMutation({
    mutationFn: async (data: { name: string; config: DashboardConfig }) => {
      return apiRequest('POST', '/api/dashboards', data);
    },
    onSuccess: (response) => {
      // Update the dashboard state with the new ID
      response.json().then((newDashboard: Dashboard) => {
        setDashboardState(prev => ({ ...prev, id: newDashboard.id }));
      });
      toast({ title: 'Dashboard saved', description: 'Your dashboard has been saved successfully.' });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboards'] });
      setIsSaveDialogOpen(false);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to save dashboard.', variant: 'destructive' });
    },
  });

  // Update mutation (update existing)
  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; name: string; config: DashboardConfig }) => {
      return apiRequest('PUT', `/api/dashboards/${data.id}`, { name: data.name, config: data.config });
    },
    onSuccess: () => {
      toast({ title: 'Dashboard updated', description: 'Your dashboard has been updated successfully.' });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboards'] });
      setIsSaveDialogOpen(false);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update dashboard.', variant: 'destructive' });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/dashboards/${id}`);
    },
    onSuccess: () => {
      toast({ title: 'Dashboard deleted', description: 'Dashboard has been removed.' });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboards'] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete dashboard.', variant: 'destructive' });
    },
  });

  // Measure container width
  useEffect(() => {
    const updateWidth = () => {
      if (canvasRef.current) {
        setContainerWidth(canvasRef.current.offsetWidth);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    
    const observer = new ResizeObserver(updateWidth);
    if (canvasRef.current) {
      observer.observe(canvasRef.current);
    }
    
    return () => {
      window.removeEventListener('resize', updateWidth);
      observer.disconnect();
    };
  }, []);

  // Get selected widget
  const selectedWidget = dashboardState.widgets.find(w => w.id === selectedWidgetId) || null;

  // Add new chart
  const handleAddChart = useCallback((type: ChartType = 'bar') => {
    const id = `widget-${Date.now()}`;
    const newWidget: DashboardWidget = {
      ...DEFAULT_WIDGET,
      id,
      type,
      title: `${CHART_TYPES.find(t => t.id === type)?.label || 'Chart'} ${dashboardState.widgets.length + 1}`,
    };
    
    // Calculate position for new widget
    const maxY = dashboardState.layouts.reduce((max, l) => Math.max(max, l.y + l.h), 0);
    const newLayout: WidgetLayout = {
      i: id,
      x: 0,
      y: maxY,
      w: 6,
      h: 4,
      minW: 2,
      minH: 2,
    };
    
    setDashboardState(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget],
      layouts: [...prev.layouts, newLayout],
    }));
    
    setSelectedWidgetId(id);
    toast({ title: 'Chart added', description: 'Configure the chart using the right panel.' });
  }, [dashboardState.widgets.length, dashboardState.layouts, toast]);

  // Update widget
  const handleUpdateWidget = useCallback((updates: Partial<DashboardWidget>) => {
    if (!selectedWidgetId) return;
    
    setDashboardState(prev => ({
      ...prev,
      widgets: prev.widgets.map(w =>
        w.id === selectedWidgetId ? { ...w, ...updates } : w
      ),
    }));
  }, [selectedWidgetId]);

  // Delete widget
  const handleDeleteWidget = useCallback(() => {
    if (!selectedWidgetId) return;
    
    setDashboardState(prev => ({
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== selectedWidgetId),
      layouts: prev.layouts.filter(l => l.i !== selectedWidgetId),
    }));
    setSelectedWidgetId(null);
    toast({ title: 'Chart removed' });
  }, [selectedWidgetId, toast]);

  // Duplicate widget
  const handleDuplicateWidget = useCallback(() => {
    if (!selectedWidget) return;
    
    const id = `widget-${Date.now()}`;
    const newWidget: DashboardWidget = {
      ...selectedWidget,
      id,
      title: `${selectedWidget.title} (Copy)`,
    };
    
    const originalLayout = dashboardState.layouts.find(l => l.i === selectedWidgetId);
    const newLayout: WidgetLayout = {
      i: id,
      x: (originalLayout?.x || 0) + 1,
      y: (originalLayout?.y || 0) + 1,
      w: originalLayout?.w || 6,
      h: originalLayout?.h || 4,
      minW: 2,
      minH: 2,
    };
    
    setDashboardState(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget],
      layouts: [...prev.layouts, newLayout],
    }));
    
    setSelectedWidgetId(id);
    toast({ title: 'Chart duplicated' });
  }, [selectedWidget, selectedWidgetId, dashboardState.layouts, toast]);

  // Remove widget from canvas
  const handleRemoveWidget = useCallback((id: string) => {
    setDashboardState(prev => ({
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== id),
      layouts: prev.layouts.filter(l => l.i !== id),
    }));
    if (selectedWidgetId === id) {
      setSelectedWidgetId(null);
    }
  }, [selectedWidgetId]);

  // Update layouts
  const handleLayoutChange = useCallback((layouts: WidgetLayout[]) => {
    setDashboardState(prev => ({ ...prev, layouts }));
  }, []);

  // Handle field drag (for data source selection)
  const handleDragField = useCallback((field: DataField, source: DataSourceType) => {
    setSelectedDataSource(source);
  }, []);

  // Save dashboard
  const handleSaveDashboard = useCallback(() => {
    const config: DashboardConfig = {
      charts: dashboardState.widgets.map(w => ({
        id: w.id,
        chartType: w.type,
        dataSource: w.dataSource,
        title: w.title,
        x: dashboardState.layouts.find(l => l.i === w.id)?.x || 0,
        y: dashboardState.layouts.find(l => l.i === w.id)?.y || 0,
        width: dashboardState.layouts.find(l => l.i === w.id)?.w || 6,
        height: dashboardState.layouts.find(l => l.i === w.id)?.h || 4,
        config: {
          xAxis: w.xAxis,
          yAxis: w.yAxis,
          colorScheme: w.colorScheme,
          showLegend: w.showLegend,
          showLabels: w.showLabels,
          filters: w.filters,
        },
      })),
      colorScheme: dashboardState.colorScheme,
    };
    
    // If we have an existing dashboard ID, update it; otherwise create new
    if (dashboardState.id) {
      updateMutation.mutate({ id: dashboardState.id, name: dashboardState.name, config });
    } else {
      saveMutation.mutate({ name: dashboardState.name, config });
    }
  }, [dashboardState, saveMutation, updateMutation]);

  // Load dashboard
  const handleLoadDashboard = useCallback((dashboard: Dashboard) => {
    const config = dashboard.config as DashboardConfig;
    
    const widgets: DashboardWidget[] = config.charts.map(chart => ({
      id: chart.id,
      type: chart.chartType as ChartType,
      title: chart.title,
      dataSource: chart.dataSource as DataSourceType,
      xAxis: (chart.config as any)?.xAxis,
      yAxis: (chart.config as any)?.yAxis,
      filters: (chart.config as any)?.filters || [],
      colorScheme: (chart.config as any)?.colorScheme || 'uae-blue',
      showLegend: (chart.config as any)?.showLegend ?? true,
      showLabels: (chart.config as any)?.showLabels ?? false,
    }));
    
    const layouts: WidgetLayout[] = config.charts.map(chart => ({
      i: chart.id,
      x: chart.x,
      y: chart.y,
      w: chart.width,
      h: chart.height,
      minW: 2,
      minH: 2,
    }));
    
    setDashboardState({
      id: dashboard.id,
      name: dashboard.name,
      description: dashboard.description || '',
      widgets,
      layouts,
      globalFilters: [],
      colorScheme: config.colorScheme || 'uae-blue',
      gridCols: 12,
      rowHeight: 80,
    });
    
    setSelectedWidgetId(null);
    setIsLoadDialogOpen(false);
    toast({ title: 'Dashboard loaded', description: `Loaded "${dashboard.name}"` });
  }, [toast]);

  // Clear canvas
  const handleClearCanvas = useCallback(() => {
    setDashboardState(prev => ({
      ...prev,
      widgets: [],
      layouts: [],
    }));
    setSelectedWidgetId(null);
    toast({ title: 'Canvas cleared' });
  }, [toast]);

  // Export as PDF
  const handleExportPDF = useCallback(async () => {
    if (!canvasRef.current || dashboardState.widgets.length === 0) {
      toast({ title: 'Nothing to export', description: 'Add some charts first.', variant: 'destructive' });
      return;
    }

    toast({ title: 'Generating PDF...', description: 'Please wait while we capture all charts.' });

    try {
      const container = canvasRef.current;
      const isDark = document.documentElement.classList.contains('dark');
      
      // Get all grid items (chart cards)
      const gridItems = Array.from(container.querySelectorAll('.react-grid-item')) as HTMLElement[];
      
      // Capture each chart card as an image
      const chartImages = new Map<number, string>();
      
      for (let i = 0; i < gridItems.length; i++) {
        const item = gridItems[i];
        try {
          // Scroll the item into view to ensure it's rendered
          item.scrollIntoView({ block: 'nearest' });
          
          // Wait a bit for any animations/renders
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const canvas = await html2canvas(item, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: isDark ? '#374151' : '#ffffff',
            allowTaint: true,
          });
          
          chartImages.set(i, canvas.toDataURL('image/png'));
        } catch (e) {
          console.warn(`Failed to capture chart ${i}:`, e);
        }
      }
      
      // Calculate canvas dimensions based on grid layout
      const { gridCols, rowHeight, layouts } = dashboardState;
      const containerWidth = container.offsetWidth - 32;
      const colWidth = containerWidth / gridCols;
      const margin = 16;
      
      // Find the maximum extent of all widgets
      let maxBottom = 0;
      layouts.forEach(layout => {
        const bottom = (layout.y + layout.h) * rowHeight + margin;
        if (bottom > maxBottom) maxBottom = bottom;
      });
      
      const canvasWidth = containerWidth;
      const canvasHeight = maxBottom + margin + 60;
      
      // Create export canvas
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = canvasWidth * 2;
      exportCanvas.height = canvasHeight * 2;
      const ctx = exportCanvas.getContext('2d')!;
      ctx.scale(2, 2);
      
      // Fill background
      ctx.fillStyle = isDark ? '#1f2937' : '#f5f5f5';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      // Draw title
      ctx.fillStyle = isDark ? '#f9fafb' : '#1f2937';
      ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
      ctx.fillText(dashboardState.name, 16, 30);
      
      // Draw subtitle
      ctx.fillStyle = isDark ? '#9ca3af' : '#6b7280';
      ctx.font = '12px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${dashboardState.widgets.length} charts • Generated ${new Date().toLocaleDateString()}`, 16, 48);
      
      const titleOffset = 60;
      
      // Load image helper
      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new window.Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      };
      
      // Draw each widget using captured images
      for (let i = 0; i < dashboardState.widgets.length; i++) {
        const widget = dashboardState.widgets[i];
        const layout = layouts.find(l => l.i === widget.id);
        if (!layout) continue;
        
        const x = layout.x * colWidth + margin / 2;
        const y = layout.y * rowHeight + margin / 2 + titleOffset;
        const w = layout.w * colWidth - margin;
        const h = layout.h * rowHeight - margin;
        
        const chartImageData = chartImages.get(i);
        if (chartImageData) {
          try {
            const img = await loadImage(chartImageData);
            ctx.drawImage(img, x, y, w, h);
          } catch (e) {
            // Draw placeholder
            ctx.fillStyle = isDark ? '#374151' : '#ffffff';
            ctx.fillRect(x, y, w, h);
            ctx.fillStyle = isDark ? '#9ca3af' : '#6b7280';
            ctx.font = '12px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText('Chart unavailable', x + w / 2, y + h / 2);
            ctx.textAlign = 'left';
          }
        }
      }
      
      // Convert to PDF
      const imgData = exportCanvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvasWidth > canvasHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvasWidth, canvasHeight],
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvasWidth, canvasHeight);
      pdf.save(`${dashboardState.name.replace(/\s+/g, '_').toLowerCase()}.pdf`);
      
      toast({ title: 'PDF exported', description: 'Dashboard has been downloaded.' });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({ title: 'Export failed', description: 'Could not generate PDF.', variant: 'destructive' });
    }
  }, [dashboardState, toast]);

  // Export as PNG
  const handleExportPNG = useCallback(async () => {
    if (!canvasRef.current || dashboardState.widgets.length === 0) {
      toast({ title: 'Nothing to export', description: 'Add some charts first.', variant: 'destructive' });
      return;
    }

    toast({ title: 'Generating PNG...', description: 'Please wait while we capture all charts.' });

    try {
      const container = canvasRef.current;
      const isDark = document.documentElement.classList.contains('dark');
      
      // Get all grid items (chart cards)
      const gridItems = Array.from(container.querySelectorAll('.react-grid-item')) as HTMLElement[];
      
      // Capture each chart card as an image
      const chartImages = new Map<number, string>();
      
      for (let i = 0; i < gridItems.length; i++) {
        const item = gridItems[i];
        try {
          item.scrollIntoView({ block: 'nearest' });
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const canvas = await html2canvas(item, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: isDark ? '#374151' : '#ffffff',
            allowTaint: true,
          });
          
          chartImages.set(i, canvas.toDataURL('image/png'));
        } catch (e) {
          console.warn(`Failed to capture chart ${i}:`, e);
        }
      }
      
      // Calculate canvas dimensions
      const { gridCols, rowHeight, layouts } = dashboardState;
      const containerWidth = container.offsetWidth - 32;
      const colWidth = containerWidth / gridCols;
      const margin = 16;
      
      let maxBottom = 0;
      layouts.forEach(layout => {
        const bottom = (layout.y + layout.h) * rowHeight + margin;
        if (bottom > maxBottom) maxBottom = bottom;
      });
      
      const canvasWidth = containerWidth;
      const canvasHeight = maxBottom + margin + 60;
      
      // Create export canvas
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = canvasWidth * 2;
      exportCanvas.height = canvasHeight * 2;
      const ctx = exportCanvas.getContext('2d')!;
      ctx.scale(2, 2);
      
      // Fill background
      ctx.fillStyle = isDark ? '#1f2937' : '#f5f5f5';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      // Draw title
      ctx.fillStyle = isDark ? '#f9fafb' : '#1f2937';
      ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
      ctx.fillText(dashboardState.name, 16, 30);
      
      // Draw subtitle
      ctx.fillStyle = isDark ? '#9ca3af' : '#6b7280';
      ctx.font = '12px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${dashboardState.widgets.length} charts • Generated ${new Date().toLocaleDateString()}`, 16, 48);
      
      const titleOffset = 60;
      
      // Load image helper
      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new window.Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      };
      
      // Draw each widget
      for (let i = 0; i < dashboardState.widgets.length; i++) {
        const widget = dashboardState.widgets[i];
        const layout = layouts.find(l => l.i === widget.id);
        if (!layout) continue;
        
        const x = layout.x * colWidth + margin / 2;
        const y = layout.y * rowHeight + margin / 2 + titleOffset;
        const w = layout.w * colWidth - margin;
        const h = layout.h * rowHeight - margin;
        
        const chartImageData = chartImages.get(i);
        if (chartImageData) {
          try {
            const img = await loadImage(chartImageData);
            ctx.drawImage(img, x, y, w, h);
          } catch (e) {
            ctx.fillStyle = isDark ? '#374151' : '#ffffff';
            ctx.fillRect(x, y, w, h);
            ctx.fillStyle = isDark ? '#9ca3af' : '#6b7280';
            ctx.font = '12px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText('Chart unavailable', x + w / 2, y + h / 2);
            ctx.textAlign = 'left';
          }
        }
      }
      
      // Download PNG
      const link = document.createElement('a');
      link.download = `${dashboardState.name.replace(/\s+/g, '_').toLowerCase()}.png`;
      link.href = exportCanvas.toDataURL('image/png');
      link.click();
      
      toast({ title: 'PNG exported', description: 'Dashboard has been downloaded.' });
    } catch (error) {
      console.error('PNG export error:', error);
      toast({ title: 'Export failed', description: 'Could not generate PNG.', variant: 'destructive' });
    }
  }, [dashboardState, toast]);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 border-b border-border bg-background px-4 py-2">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">Dashboard Builder</h1>
          <Input
            value={dashboardState.name}
            onChange={(e) => setDashboardState(prev => ({ ...prev, name: e.target.value }))}
            className="w-56 h-8"
            placeholder="Dashboard name"
          />
          <Badge variant="secondary" className="gap-1">
            <Grid3X3 className="h-3 w-3" />
            {dashboardState.widgets.length} charts
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Add Chart Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Add Chart
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {CHART_TYPES.slice(0, 8).map((type) => (
                <DropdownMenuItem
                  key={type.id}
                  onClick={() => handleAddChart(type.id)}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  {type.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              {CHART_TYPES.slice(8).map((type) => (
                <DropdownMenuItem
                  key={type.id}
                  onClick={() => handleAddChart(type.id)}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  {type.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-6 w-px bg-border" />

          {/* Save */}
          <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Dashboard</DialogTitle>
                <DialogDescription>
                  Save your dashboard configuration to load it later.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  value={dashboardState.name}
                  onChange={(e) => setDashboardState(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Dashboard name"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
                  Cancel
                </Button>
                {dashboardState.id && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      // Clear the ID to save as new
                      setDashboardState(prev => ({ ...prev, id: undefined }));
                      saveMutation.mutate({ name: dashboardState.name, config: {
                        charts: dashboardState.widgets.map(w => ({
                          id: w.id,
                          chartType: w.type,
                          dataSource: w.dataSource,
                          title: w.title,
                          x: dashboardState.layouts.find(l => l.i === w.id)?.x || 0,
                          y: dashboardState.layouts.find(l => l.i === w.id)?.y || 0,
                          width: dashboardState.layouts.find(l => l.i === w.id)?.w || 6,
                          height: dashboardState.layouts.find(l => l.i === w.id)?.h || 4,
                          config: {
                            xAxis: w.xAxis,
                            yAxis: w.yAxis,
                            colorScheme: w.colorScheme,
                            showLegend: w.showLegend,
                            showLabels: w.showLabels,
                            filters: w.filters,
                          },
                        })),
                        colorScheme: dashboardState.colorScheme,
                      }});
                    }} 
                    disabled={saveMutation.isPending}
                  >
                    Save as New
                  </Button>
                )}
                <Button onClick={handleSaveDashboard} disabled={saveMutation.isPending || updateMutation.isPending}>
                  {saveMutation.isPending || updateMutation.isPending 
                    ? 'Saving...' 
                    : dashboardState.id 
                      ? 'Update Dashboard' 
                      : 'Save Dashboard'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Load */}
          <Dialog open={isLoadDialogOpen} onOpenChange={setIsLoadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FolderOpen className="mr-2 h-4 w-4" />
                Load
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Load Dashboard</DialogTitle>
                <DialogDescription>
                  Select a saved dashboard to load, or delete ones you no longer need.
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-64 space-y-2 overflow-y-auto py-4">
                {savedDashboards?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No saved dashboards yet.
                  </p>
                ) : (
                  savedDashboards?.map((dashboard) => (
                    <div
                      key={dashboard.id}
                      className="flex items-center gap-2"
                    >
                      <Button
                        variant="outline"
                        className="flex-1 justify-start"
                        onClick={() => handleLoadDashboard(dashboard)}
                      >
                        {dashboard.name}
                        {dashboardState.id === dashboard.id && (
                          <Badge variant="secondary" className="ml-2">Current</Badge>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete "${dashboard.name}"?`)) {
                            deleteMutation.mutate(dashboard.id);
                            // If we're deleting the currently loaded dashboard, reset the ID
                            if (dashboardState.id === dashboard.id) {
                              setDashboardState(prev => ({ ...prev, id: undefined }));
                            }
                          }
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Clear */}
          <Button variant="outline" size="sm" onClick={handleClearCanvas}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear
          </Button>

          <div className="h-6 w-px bg-border" />

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="default">
                <Download className="mr-2 h-4 w-4" />
                Export
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileJson className="mr-2 h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPNG}>
                <Image className="mr-2 h-4 w-4" />
                Export as PNG
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Data Fields */}
        <div className="w-64 flex-shrink-0">
          <DataFieldPanel
            selectedDataSource={selectedDataSource}
            onSelectDataSource={setSelectedDataSource}
            onDragField={handleDragField}
          />
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 overflow-auto bg-muted/30"
        >
          <DashboardCanvas
            ref={dashboardCanvasRef}
            widgets={dashboardState.widgets}
            layouts={dashboardState.layouts}
            selectedWidgetId={selectedWidgetId}
            onSelectWidget={setSelectedWidgetId}
            onLayoutChange={handleLayoutChange}
            onRemoveWidget={handleRemoveWidget}
            gridCols={dashboardState.gridCols}
            rowHeight={dashboardState.rowHeight}
            containerWidth={containerWidth}
          />
        </div>

        {/* Right Panel - Chart Configuration */}
        <div className="w-80 flex-shrink-0">
          <ChartConfigPanel
            widget={selectedWidget}
            onUpdateWidget={handleUpdateWidget}
            onDeleteWidget={handleDeleteWidget}
            onDuplicateWidget={handleDuplicateWidget}
          />
        </div>
      </div>
    </div>
  );
}
