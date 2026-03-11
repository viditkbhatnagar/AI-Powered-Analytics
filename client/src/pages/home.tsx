import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Truck,
  Ship,
  Plane,
  Warehouse,
  Package,
  BarChart3,
  Layers,
  Users,
  Upload,
  ArrowRight,
} from "lucide-react";
import type { Industry } from "@shared/schema";

const industryIcons: Record<string, React.ElementType> = {
  truck: Truck,
  ship: Ship,
  plane: Plane,
  warehouse: Warehouse,
  package: Package,
  default: Package,
};

export default function HomePage() {
  const { data: industries, isLoading: industriesLoading } = useQuery<Industry[]>({
    queryKey: ["/api/industries"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<{
    domainCount: number;
    roleCount: number;
    chartCount: number;
  }>({
    queryKey: ["/api/stats"],
  });

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8">
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            AI-Powered Career Analytics
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Explore industry trends, salary benchmarks, career domains, and certification
            pathways for the UAE Supply Chain & Logistics industry. Make data-driven
            career decisions with interactive visualizations.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Domains
            </CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.domainCount ?? 18}</div>
            )}
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Career Roles
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.roleCount ?? 150}+</div>
            )}
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Visualizations
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.chartCount ?? 30}</div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Industries</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {industriesLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader>
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <Skeleton className="mt-4 h-6 w-32" />
                    <Skeleton className="mt-2 h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-9 w-full" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              {industries?.map((industry) => {
                const IconComponent = industryIcons[industry.icon] || industryIcons.default;
                return (
                  <Card
                    key={industry.id}
                    className="group overflow-hidden transition-shadow hover:shadow-lg"
                    data-testid={`card-industry-${industry.id}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <IconComponent className="h-6 w-6" />
                        </div>
                        {industry.isPreloaded && (
                          <Badge variant="secondary" className="text-xs">
                            Pre-loaded
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="mt-4">{industry.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {industry.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href={`/domains?industry=${industry.id}`}>
                        <Button
                          className="w-full group-hover:bg-primary"
                          variant="outline"
                          data-testid={`button-explore-${industry.id}`}
                        >
                          Explore Domains
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}

              <Card className="flex flex-col items-center justify-center border-dashed p-8 text-center">
                <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
                <CardTitle className="text-lg">Upload New Industry</CardTitle>
                <CardDescription className="mt-2 mb-4">
                  Add your own industry data from CSV, Excel, or Word files
                </CardDescription>
                <Link href="/upload">
                  <Button variant="outline" data-testid="button-upload-industry">
                    Upload Data
                  </Button>
                </Link>
              </Card>
            </>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/visualizations">
            <Card className="hover-elevate cursor-pointer p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/10 text-chart-1">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">Browse Charts</div>
                  <div className="text-sm text-muted-foreground">30 visualizations</div>
                </div>
              </div>
            </Card>
          </Link>
          <Link href="/dashboard-builder">
            <Card className="hover-elevate cursor-pointer p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10 text-chart-2">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">Build Dashboard</div>
                  <div className="text-sm text-muted-foreground">Custom analytics</div>
                </div>
              </div>
            </Card>
          </Link>
          <Link href="/compare">
            <Card className="hover-elevate cursor-pointer p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10 text-chart-3">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">Compare Domains</div>
                  <div className="text-sm text-muted-foreground">Side-by-side view</div>
                </div>
              </div>
            </Card>
          </Link>
          <Link href="/upload">
            <Card className="hover-elevate cursor-pointer p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10 text-chart-4">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">Upload Data</div>
                  <div className="text-sm text-muted-foreground">AI extraction</div>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}
