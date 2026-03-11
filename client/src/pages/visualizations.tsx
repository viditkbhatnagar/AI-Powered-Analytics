import { useState, useMemo } from "react";
import { Link, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Expand,
  TrendingUp,
  Building2,
  DollarSign,
  Award,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { ChartRenderer } from "@/components/charts/chart-renderer";
import type { PrebuiltChart, Initiative, Domain, Salary, Certification, Company, Role } from "@shared/schema";

const categoryIcons: Record<string, React.ElementType> = {
  trends: TrendingUp,
  domains: Building2,
  salary: DollarSign,
  certifications: Award,
};

const prebuiltCharts: PrebuiltChart[] = [
  { id: "1", name: "UAE Initiatives Timeline", description: "Timeline showing 16 UAE government initiatives from 2020-2050 with scopes, timeframes, and KPI targets", category: "trends", chartType: "gantt", library: "echarts", dataSource: "initiatives" },
  { id: "2", name: "Initiative KPI Dashboard", description: "Multi-gauge dashboard showing technology adoption, carbon reduction, and capacity metrics", category: "trends", chartType: "gauge", library: "echarts", dataSource: "initiatives" },
  { id: "3", name: "Regional Distribution", description: "Interactive donut chart showing initiatives by emirate with detailed breakdowns", category: "trends", chartType: "pie", library: "echarts", dataSource: "initiatives" },
  { id: "4", name: "Sector Impact Analysis", description: "Sankey diagram showing flow from government initiatives to affected supply chain domains", category: "trends", chartType: "sankey", library: "echarts", dataSource: "initiatives" },
  { id: "5", name: "Target Achievement", description: "Bullet charts showing progress towards initiative KPI targets with current values", category: "trends", chartType: "bullet", library: "echarts", dataSource: "initiatives" },
  { id: "6", name: "Categories Breakdown", description: "Sunburst chart showing initiative categories with individual initiatives as outer rings", category: "trends", chartType: "sunburst", library: "echarts", dataSource: "initiatives" },
  { id: "7", name: "Investment & Capacity", description: "Multi-series area chart showing projected growth for TEU capacity and GDP contribution", category: "trends", chartType: "area", library: "echarts", dataSource: "initiatives" },
  { id: "8", name: "Sustainability Goals", description: "Circular progress indicators for Net Zero 2050 and carbon reduction targets", category: "trends", chartType: "progress", library: "echarts", dataSource: "initiatives" },
  { id: "9", name: "Domain Hierarchy", description: "Treemap showing 18 supply chain domains sized by role count with nested sub-domains", category: "domains", chartType: "treemap", library: "echarts", dataSource: "domains" },
  { id: "10", name: "Sub-Domain Distribution", description: "Multi-level sunburst: Supply Chain center, domains ring 1, sub-domains ring 2", category: "domains", chartType: "sunburst", library: "echarts", dataSource: "domains" },
  { id: "11", name: "Role Distribution", description: "Horizontal bar chart with 18 domains sorted by unique role count descending", category: "domains", chartType: "bar", library: "echarts", dataSource: "domains" },
  { id: "12", name: "Company Network", description: "Force-directed network graph showing companies connected to their operating domains", category: "domains", chartType: "network", library: "echarts", dataSource: "companies" },
  { id: "13", name: "Domain Interconnections", description: "Circular graph showing relationships between domains based on shared roles", category: "domains", chartType: "chord", library: "echarts", dataSource: "domains" },
  { id: "14", name: "Job Role Hierarchy", description: "Tree chart showing role levels: Executive → Senior → Mid → Entry with examples", category: "domains", chartType: "tree", library: "echarts", dataSource: "roles" },
  { id: "15", name: "Domain Complexity", description: "Radar chart comparing domains across sub-domain count, roles, companies, salary range", category: "domains", chartType: "radar", library: "echarts", dataSource: "domains" },
  { id: "16", name: "Companies by Domain", description: "Grouped bar chart showing company count and role count for top 10 domains", category: "domains", chartType: "bar", library: "echarts", dataSource: "companies" },
  { id: "17", name: "Salary Range by Domain", description: "Box plot showing salary distribution per domain with min, Q1, median, Q3, max in AED", category: "salary", chartType: "boxplot", library: "echarts", dataSource: "salaries" },
  { id: "18", name: "Role-wise Comparison", description: "Grouped bar chart with Entry, Mid, Senior, Executive levels and salary ranges", category: "salary", chartType: "bar", library: "echarts", dataSource: "salaries" },
  { id: "19", name: "Highest Paying Domains", description: "Horizontal bar chart showing top 10 domains by maximum salary, sorted descending", category: "salary", chartType: "bar", library: "echarts", dataSource: "salaries" },
  { id: "20", name: "Salary Distribution", description: "Histogram of all salary values with 10,000 AED bins showing frequency distribution", category: "salary", chartType: "histogram", library: "echarts", dataSource: "salaries" },
  { id: "21", name: "Domain Salary Heatmap", description: "Heatmap with role levels on X-axis, domains on Y-axis, color intensity for salary", category: "salary", chartType: "heatmap", library: "echarts", dataSource: "salaries" },
  { id: "22", name: "Salary Progression", description: "Waterfall chart showing salary growth from Entry through Mid, Senior, Executive", category: "salary", chartType: "waterfall", library: "echarts", dataSource: "salaries" },
  { id: "23", name: "Entry vs Max Gap", description: "Dumbbell chart with domains on Y-axis showing entry and maximum salary positions", category: "salary", chartType: "dumbbell", library: "echarts", dataSource: "salaries" },
  { id: "24", name: "Salary Percentiles", description: "Violin-style plot showing full salary distribution shape per domain", category: "salary", chartType: "violin", library: "echarts", dataSource: "salaries" },
  { id: "25", name: "Certification Pathway", description: "Sankey diagram: roles → certifications → career benefits with flow visualization", category: "certifications", chartType: "sankey", library: "echarts", dataSource: "certifications" },
  { id: "26", name: "Provider Distribution", description: "Donut chart showing certification count per provider: ASCM, CIPS, IATA, FIATA, PMI, ASQ", category: "certifications", chartType: "pie", library: "echarts", dataSource: "certifications" },
  { id: "27", name: "Certs by Domain", description: "Stacked bar chart with domains on X-axis and certification providers as segments", category: "certifications", chartType: "bar", library: "echarts", dataSource: "certifications" },
  { id: "28", name: "Career Progression", description: "Timeline showing career stages with certification milestones and salary progression", category: "certifications", chartType: "timeline", library: "echarts", dataSource: "certifications" },
  { id: "29", name: "Certification ROI", description: "Bubble chart: cost on X-axis, salary increase on Y-axis, bubble size for duration", category: "certifications", chartType: "bubble", library: "echarts", dataSource: "certifications" },
  { id: "30", name: "Role-Cert Matrix", description: "Interactive matrix grid with roles as rows and certifications as columns", category: "certifications", chartType: "matrix", library: "echarts", dataSource: "certifications" },
];

export default function VisualizationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const searchParams = useSearch();
  const categoryParam = new URLSearchParams(searchParams).get("category") || "all";
  const [activeCategory, setActiveCategory] = useState(categoryParam);

  // Fetch all data upfront for chart previews
  const { data: initiatives, isLoading: loadingInitiatives } = useQuery<Initiative[]>({
    queryKey: ['/api/initiatives'],
  });

  const { data: domains, isLoading: loadingDomains } = useQuery<(Domain & { subdomainCount?: number; roleCount?: number; companies?: string[] })[]>({
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

  // Combined chart data
  const chartData = useMemo(() => ({
    initiatives,
    domains,
    salaries,
    certifications,
    companies,
    roles,
  }), [initiatives, domains, salaries, certifications, companies, roles]);

  const isDataLoading = loadingInitiatives || loadingDomains || loadingSalaries || 
                        loadingCertifications || loadingCompanies || loadingRoles;

  const { data: charts = prebuiltCharts } = useQuery<PrebuiltChart[]>({
    queryKey: ["/api/charts/prebuilt"],
    initialData: prebuiltCharts,
  });

  const filteredCharts = charts.filter((chart) => {
    const matchesSearch = chart.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chart.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || chart.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryCounts = {
    all: charts.length,
    trends: charts.filter((c) => c.category === "trends").length,
    domains: charts.filter((c) => c.category === "domains").length,
    salary: charts.filter((c) => c.category === "salary").length,
    certifications: charts.filter((c) => c.category === "certifications").length,
  };

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">Visualizations</h1>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Live Preview
            </Badge>
          </div>
          <p className="mt-1 text-muted-foreground">
            Explore 30 interactive charts powered by Apache ECharts
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search charts..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-charts"
            />
          </div>
          <Link href="/dashboard-builder">
            <Button data-testid="button-create-dashboard">
              Create Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="all" data-testid="tab-all">
            All ({categoryCounts.all})
          </TabsTrigger>
          <TabsTrigger value="trends" data-testid="tab-trends">
            <TrendingUp className="mr-1.5 h-4 w-4" />
            Trends ({categoryCounts.trends})
          </TabsTrigger>
          <TabsTrigger value="domains" data-testid="tab-domains">
            <Building2 className="mr-1.5 h-4 w-4" />
            Domains ({categoryCounts.domains})
          </TabsTrigger>
          <TabsTrigger value="salary" data-testid="tab-salary">
            <DollarSign className="mr-1.5 h-4 w-4" />
            Salary ({categoryCounts.salary})
          </TabsTrigger>
          <TabsTrigger value="certifications" data-testid="tab-certifications">
            <Award className="mr-1.5 h-4 w-4" />
            Certifications ({categoryCounts.certifications})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {isDataLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <div className="mt-4 flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredCharts.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <BarChart3 className="mb-4 h-16 w-16 text-muted-foreground/50" />
            <h3 className="text-lg font-medium">No charts found</h3>
            <p className="mt-1 text-muted-foreground">
              Try adjusting your search or filter
            </p>
          </div>
        ) : (
          filteredCharts.map((chart) => {
            const CategoryIcon = categoryIcons[chart.category] || BarChart3;
            
            return (
              <Card
                key={chart.id}
                className="group overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/5 border-border/50"
                data-testid={`card-chart-${chart.id}`}
              >
                {/* Chart Preview Container */}
                <div className="relative h-48 bg-card overflow-hidden">
                  <ChartRenderer
                    chartId={chart.id}
                    chartType={chart.chartType}
                    library={chart.library}
                    dataSource={chart.dataSource}
                    data={chartData}
                    height={192}
                    showToolbox={false}
                    isPreview={true}
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm opacity-0 transition-all duration-300 group-hover:opacity-100 z-10">
                    <Link href={`/visualizations/${chart.id}`}>
                      <Button size="sm" className="shadow-lg" data-testid={`button-expand-${chart.id}`}>
                        <Expand className="mr-2 h-4 w-4" />
                        View Full Chart
                      </Button>
                    </Link>
                  </div>
                  
                  {/* Chart Number Badge */}
                  <div className="absolute top-2 right-2 z-20">
                    <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-xs font-mono">
                      #{chart.id}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="pb-2">
                  <CardTitle className="text-base leading-tight">{chart.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {chart.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <CategoryIcon className="h-3 w-3" />
                      {chart.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {chart.chartType}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
