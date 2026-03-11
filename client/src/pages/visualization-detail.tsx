import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Image,
  FileText,
  FileSpreadsheet,
  Maximize2,
  Minimize2,
  ZoomIn,
  Move,
  Info,
  Sparkles,
} from "lucide-react";
import { ChartRenderer, ChartRendererHandle } from "@/components/charts/chart-renderer";
import type { PrebuiltChart, Initiative, Domain, Salary, Certification, Company, Role } from "@shared/schema";
import { useState, useMemo, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

const prebuiltCharts: PrebuiltChart[] = [
  { id: "1", name: "UAE Initiatives Timeline", description: "Timeline showing 16 UAE government initiatives from 2020-2050 with their scopes, timeframes, and KPI targets. Color-coded by emirate: Dubai (blue), Abu Dhabi (green), Sharjah (teal), Fujairah (orange), Federal (purple).", category: "trends", chartType: "gantt", library: "echarts", dataSource: "initiatives" },
  { id: "2", name: "Initiative KPI Dashboard", description: "Multi-gauge dashboard showing key performance indicators including technology adoption rate, carbon reduction progress, and capacity growth metrics.", category: "trends", chartType: "gauge", library: "echarts", dataSource: "initiatives" },
  { id: "3", name: "Regional Distribution", description: "Interactive donut chart showing initiatives by emirate/scope. Hover for detailed breakdown.", category: "trends", chartType: "pie", library: "echarts", dataSource: "initiatives" },
  { id: "4", name: "Sector Impact Analysis", description: "Sankey diagram showing the flow from government initiatives to affected supply chain domains. Flow width indicates impact level.", category: "trends", chartType: "sankey", library: "echarts", dataSource: "initiatives" },
  { id: "5", name: "Target Achievement", description: "Bullet charts showing progress towards initiative KPI targets with current values and target ranges.", category: "trends", chartType: "bullet", library: "echarts", dataSource: "initiatives" },
  { id: "6", name: "Categories Breakdown", description: "Sunburst chart showing initiative categories (Infrastructure, Digital, Sustainability, Trade) with individual initiatives as outer rings.", category: "trends", chartType: "sunburst", library: "echarts", dataSource: "initiatives" },
  { id: "7", name: "Investment & Capacity", description: "Multi-series area chart showing projected growth curves for TEU capacity and GDP contribution over time.", category: "trends", chartType: "area", library: "echarts", dataSource: "initiatives" },
  { id: "8", name: "Sustainability Goals", description: "Circular progress indicators for Net Zero 2050 and carbon reduction targets with years remaining.", category: "trends", chartType: "progress", library: "echarts", dataSource: "initiatives" },
  { id: "9", name: "Domain Hierarchy", description: "Treemap showing 18 supply chain domains as rectangles sized by role count with nested sub-domains.", category: "domains", chartType: "treemap", library: "echarts", dataSource: "domains" },
  { id: "10", name: "Sub-Domain Distribution", description: "Multi-level sunburst chart: center is Supply Chain, Ring 1 shows 18 domains, Ring 2 shows sub-domains, Ring 3 shows roles.", category: "domains", chartType: "sunburst", library: "echarts", dataSource: "domains" },
  { id: "11", name: "Role Distribution", description: "Horizontal bar chart with 18 domains on Y-axis and count of unique roles on X-axis, sorted descending.", category: "domains", chartType: "bar", library: "echarts", dataSource: "domains" },
  { id: "12", name: "Company Network", description: "Force-directed network graph showing companies as nodes connected to the domains they operate in.", category: "domains", chartType: "network", library: "echarts", dataSource: "companies" },
  { id: "13", name: "Domain Interconnections", description: "Chord diagram showing relationships between domains based on shared roles and overlapping companies.", category: "domains", chartType: "chord", library: "echarts", dataSource: "domains" },
  { id: "14", name: "Job Role Hierarchy", description: "Organizational chart showing role levels: Executive > Senior > Mid > Entry with example roles at each level.", category: "domains", chartType: "tree", library: "echarts", dataSource: "roles" },
  { id: "15", name: "Domain Complexity", description: "Radar chart comparing domains across axes: sub-domain count, role count, company count, and salary range.", category: "domains", chartType: "radar", library: "echarts", dataSource: "domains" },
  { id: "16", name: "Companies by Domain", description: "Grouped bar chart with top 10 domains on X-axis, showing company count and role count as grouped bars.", category: "domains", chartType: "bar", library: "echarts", dataSource: "companies" },
  { id: "17", name: "Salary Range by Domain", description: "Box plot showing salary distribution per domain with min, Q1, median, Q3, and max values in AED.", category: "salary", chartType: "boxplot", library: "echarts", dataSource: "salaries" },
  { id: "18", name: "Role-wise Comparison", description: "Grouped bar chart with role levels (Entry, Mid, Senior, Executive) on X-axis and salary ranges by domain as groups.", category: "salary", chartType: "bar", library: "echarts", dataSource: "salaries" },
  { id: "19", name: "Highest Paying Domains", description: "Horizontal bar chart showing top 10 domains by maximum salary, sorted descending.", category: "salary", chartType: "bar", library: "echarts", dataSource: "salaries" },
  { id: "20", name: "Salary Distribution", description: "Histogram of all salary values with bins of 10,000 AED showing frequency distribution.", category: "salary", chartType: "histogram", library: "echarts", dataSource: "salaries" },
  { id: "21", name: "Domain Salary Heatmap", description: "Heatmap with role levels on X-axis, domains on Y-axis, and color intensity representing salary value.", category: "salary", chartType: "heatmap", library: "echarts", dataSource: "salaries" },
  { id: "22", name: "Salary Progression", description: "Waterfall chart showing salary growth from Entry base through Mid, Senior, and Executive increments.", category: "salary", chartType: "waterfall", library: "echarts", dataSource: "salaries" },
  { id: "23", name: "Entry vs Max Gap", description: "Dumbbell chart with domains on Y-axis and dots at entry salary and maximum salary positions.", category: "salary", chartType: "dumbbell", library: "echarts", dataSource: "salaries" },
  { id: "24", name: "Salary Percentiles", description: "Violin-style plot showing full salary distribution shape per domain with width indicating density.", category: "salary", chartType: "violin", library: "echarts", dataSource: "salaries" },
  { id: "25", name: "Certification Pathway", description: "Sankey diagram flowing from roles (left) through certifications (middle) to career benefits (right).", category: "certifications", chartType: "sankey", library: "echarts", dataSource: "certifications" },
  { id: "26", name: "Provider Distribution", description: "Donut chart showing certification count per provider: ASCM, CIPS, IATA, FIATA, PMI, ASQ.", category: "certifications", chartType: "pie", library: "echarts", dataSource: "certifications" },
  { id: "27", name: "Certs by Domain", description: "Stacked bar chart with domains on X-axis and certification providers as stacked segments.", category: "certifications", chartType: "bar", library: "echarts", dataSource: "certifications" },
  { id: "28", name: "Career Progression", description: "Timeline showing career stages with certification milestones and salary progression.", category: "certifications", chartType: "timeline", library: "echarts", dataSource: "certifications" },
  { id: "29", name: "Certification ROI", description: "Bubble chart with cost on X-axis, salary increase potential on Y-axis, bubble size for time to complete.", category: "certifications", chartType: "bubble", library: "echarts", dataSource: "certifications" },
  { id: "30", name: "Role-Cert Matrix", description: "Interactive matrix grid with roles as rows and certifications as columns. Filled cells indicate recommended.", category: "certifications", chartType: "matrix", library: "echarts", dataSource: "certifications" },
];

export default function VisualizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const chartRendererRef = useRef<ChartRendererHandle>(null);

  const chart = prebuiltCharts.find((c) => c.id === id);
  const currentIndex = prebuiltCharts.findIndex((c) => c.id === id);
  const prevChart = currentIndex > 0 ? prebuiltCharts[currentIndex - 1] : null;
  const nextChart = currentIndex < prebuiltCharts.length - 1 ? prebuiltCharts[currentIndex + 1] : null;

  // Fetch all required data based on chart's data source
  const { data: initiatives, isLoading: loadingInitiatives } = useQuery<Initiative[]>({
    queryKey: ['/api/initiatives'],
    enabled: !!chart && ['initiatives'].includes(chart.dataSource),
  });

  const { data: domains, isLoading: loadingDomains } = useQuery<(Domain & { subdomainCount?: number; roleCount?: number; companies?: string[] })[]>({
    queryKey: ['/api/domains'],
    enabled: !!chart && ['domains', 'salaries', 'companies'].includes(chart.dataSource),
  });

  const { data: salaries, isLoading: loadingSalaries } = useQuery<Salary[]>({
    queryKey: ['/api/salaries'],
    enabled: !!chart && ['salaries'].includes(chart.dataSource),
  });

  const { data: certifications, isLoading: loadingCertifications } = useQuery<Certification[]>({
    queryKey: ['/api/certifications'],
    enabled: !!chart && ['certifications'].includes(chart.dataSource),
  });

  const { data: companies, isLoading: loadingCompanies } = useQuery<Company[]>({
    queryKey: ['/api/companies'],
    enabled: !!chart && ['companies'].includes(chart.dataSource),
  });

  const { data: roles, isLoading: loadingRoles } = useQuery<Role[]>({
    queryKey: ['/api/roles'],
    enabled: !!chart && ['roles', 'certifications'].includes(chart.dataSource),
  });

  // Combine all data for the chart renderer
  const chartData = useMemo(() => ({
    initiatives,
    domains,
    salaries,
    certifications,
    companies,
    roles,
  }), [initiatives, domains, salaries, certifications, companies, roles]);

  const isLoading = loadingInitiatives || loadingDomains || loadingSalaries || 
                    loadingCertifications || loadingCompanies || loadingRoles;

  // Get export data based on chart's data source
  const getExportData = useCallback(() => {
    if (!chart) return [];
    
    switch (chart.dataSource) {
      case 'initiatives':
        return initiatives?.map(i => ({
          Name: i.name,
          Scope: i.scope,
          'Start Year': i.startYear,
          'End Year': i.endYear,
          Category: i.category,
          Description: i.description,
          'KPI Target': i.kpiTarget,
          'KPI Unit': i.kpiUnit,
        })) || [];
      case 'domains':
        return domains?.map(d => ({
          Name: d.name,
          Description: d.description,
          'Subdomain Count': d.subdomainCount || 0,
          'Role Count': d.roleCount || 0,
        })) || [];
      case 'salaries':
        return salaries?.map(s => ({
          'Domain ID': s.domainId,
          Level: s.level,
          'Min Salary (AED)': s.minSalary,
          'Max Salary (AED)': s.maxSalary,
        })) || [];
      case 'certifications':
        return certifications?.map(c => ({
          Name: c.name,
          Provider: c.provider,
          'Cost (AED)': c.cost,
          'Duration (Months)': c.durationMonths,
          Level: c.level,
          Description: c.description,
        })) || [];
      case 'companies':
        return companies?.map(c => ({
          Name: c.name,
          Type: c.type,
          Headquarters: c.headquarters,
          'Employee Count': c.employeeCount,
          Website: c.website,
        })) || [];
      case 'roles':
        return roles?.map(r => ({
          Title: r.title,
          Level: r.level,
          'Domain ID': r.domainId,
          Description: r.description,
        })) || [];
      default:
        return [];
    }
  }, [chart, initiatives, domains, salaries, certifications, companies, roles]);

  const handleExport = useCallback((format: string) => {
    if (!chart) return;
    
    const filename = chart.name.replace(/\s+/g, '_').toLowerCase();
    
    switch (format) {
      case 'png': {
        if (chartRendererRef.current) {
          chartRendererRef.current.exportToPNG(filename);
          toast({
            title: "PNG Exported",
            description: `${chart.name} has been downloaded as PNG.`,
          });
        } else {
          toast({
            title: "Export Failed",
            description: "Chart is not ready for export.",
            variant: "destructive",
          });
        }
        break;
      }
      
      case 'pdf': {
        if (chartRendererRef.current) {
          const dataURL = chartRendererRef.current.getChartDataURL(2);
          if (dataURL) {
            const pdf = new jsPDF({
              orientation: 'landscape',
              unit: 'mm',
              format: 'a4',
            });
            
            // Add title
            pdf.setFontSize(18);
            pdf.setTextColor(31, 41, 55);
            pdf.text(chart.name, 15, 20);
            
            // Add description
            pdf.setFontSize(10);
            pdf.setTextColor(107, 114, 128);
            const splitDescription = pdf.splitTextToSize(chart.description, 260);
            pdf.text(splitDescription, 15, 30);
            
            // Add chart image
            const imgWidth = 260;
            const imgHeight = 140;
            pdf.addImage(dataURL, 'PNG', 15, 45, imgWidth, imgHeight);
            
            // Add footer
            pdf.setFontSize(8);
            pdf.setTextColor(156, 163, 175);
            pdf.text(`Generated on ${new Date().toLocaleDateString()} | Data Source: ${chart.dataSource}`, 15, 195);
            
            pdf.save(`${filename}.pdf`);
            
            toast({
              title: "PDF Exported",
              description: `${chart.name} has been downloaded as PDF.`,
            });
          }
        } else {
          toast({
            title: "Export Failed",
            description: "Chart is not ready for export.",
            variant: "destructive",
          });
        }
        break;
      }
      
      case 'excel': {
        const exportData = getExportData();
        if (exportData.length > 0) {
          const worksheet = XLSX.utils.json_to_sheet(exportData);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, chart.name.slice(0, 31));
          
          // Auto-size columns
          const colWidths = Object.keys(exportData[0] || {}).map(key => ({
            wch: Math.max(key.length, 15)
          }));
          worksheet['!cols'] = colWidths;
          
          XLSX.writeFile(workbook, `${filename}.xlsx`);
          
          toast({
            title: "Excel Exported",
            description: `${chart.name} data has been downloaded as Excel.`,
          });
        } else {
          toast({
            title: "No Data",
            description: "No data available to export.",
            variant: "destructive",
          });
        }
        break;
      }
    }
  }, [chart, toast, getExportData]);

  if (!chart) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
        <Info className="h-16 w-16 text-muted-foreground/50" />
        <h2 className="text-xl font-semibold">Chart not found</h2>
        <p className="text-muted-foreground">
          The visualization you're looking for doesn't exist.
        </p>
        <Link href="/visualizations">
          <Button>Back to Gallery</Button>
        </Link>
      </div>
    );
  }

  // Calculate chart height based on fullscreen mode
  const chartHeight = isFullscreen ? 'calc(100vh - 200px)' : '600px';

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/visualizations">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{chart.name}</h1>
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                ECharts
              </Badge>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{chart.category}</Badge>
              <Badge variant="outline">{chart.chartType}</Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("png")}
            data-testid="button-export-png"
          >
            <Image className="mr-2 h-4 w-4" />
            PNG
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("pdf")}
            data-testid="button-export-pdf"
          >
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("excel")}
            data-testid="button-export-excel"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            data-testid="button-fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`grid gap-6 ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'}`}>
        {/* Chart Container */}
        <div className={isFullscreen ? '' : 'lg:col-span-3'}>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center" style={{ height: chartHeight }}>
                  <Skeleton className="w-full h-full" />
                </div>
              ) : (
                <div 
                  className="w-full"
                  style={{ height: chartHeight, minHeight: '500px' }}
                >
                  <ChartRenderer
                    ref={chartRendererRef}
                    chartId={chart.id}
                    chartType={chart.chartType}
                    library={chart.library}
                    dataSource={chart.dataSource}
                    data={chartData}
                    showToolbox={true}
                    isPreview={false}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Hidden in fullscreen */}
        {!isFullscreen && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">About this Chart</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{chart.description}</p>
                <Separator />
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data Source</span>
                    <span className="font-medium capitalize">{chart.dataSource}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chart Type</span>
                    <span className="font-medium capitalize">{chart.chartType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Library</span>
                    <Badge variant="outline" className="font-medium">Apache ECharts</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Interactions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <ZoomIn className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Scroll to zoom</div>
                    <div className="text-xs text-muted-foreground">Use mouse wheel</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Move className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Drag to pan</div>
                    <div className="text-xs text-muted-foreground">Click and drag</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Info className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Hover for details</div>
                    <div className="text-xs text-muted-foreground">Rich tooltips</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Download className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Save chart</div>
                    <div className="text-xs text-muted-foreground">Use toolbox icons</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {prevChart ? (
          <Link href={`/visualizations/${prevChart.id}`}>
            <Button variant="outline" data-testid="button-prev-chart">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{prevChart.name}</span>
              <span className="sm:hidden">Previous</span>
            </Button>
          </Link>
        ) : (
          <div />
        )}
        {nextChart ? (
          <Link href={`/visualizations/${nextChart.id}`}>
            <Button variant="outline" data-testid="button-next-chart">
              <span className="hidden sm:inline">{nextChart.name}</span>
              <span className="sm:hidden">Next</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
