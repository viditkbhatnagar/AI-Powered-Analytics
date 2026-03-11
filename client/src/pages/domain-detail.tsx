import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  Users,
  DollarSign,
  Award,
  Building2,
  ExternalLink,
  GitCompare,
  BarChart3,
  Briefcase,
} from "lucide-react";
import type { Domain, Subdomain, Role, Company, Salary } from "@shared/schema";

interface DomainDetail extends Domain {
  subdomains: (Subdomain & {
    roles: Role[];
  })[];
  companies: Company[];
  salaries: Salary[];
}

export default function DomainDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: domain, isLoading } = useQuery<DomainDetail>({
    queryKey: ["/api/domains", id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6 md:p-8">
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="mt-2 h-4 w-full max-w-xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!domain) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
        <Package className="h-16 w-16 text-muted-foreground/50" />
        <h2 className="text-xl font-semibold">Domain not found</h2>
        <p className="text-muted-foreground">
          The domain you're looking for doesn't exist.
        </p>
        <Link href="/domains">
          <Button>Back to Domains</Button>
        </Link>
      </div>
    );
  }

  const salaryRange = domain.salaries?.length
    ? {
        min: Math.min(...domain.salaries.map((s) => s.minSalary)),
        max: Math.max(...domain.salaries.map((s) => s.maxSalary)),
      }
    : null;

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Package className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{domain.name}</h1>
            <p className="mt-1 max-w-2xl text-muted-foreground">
              {domain.description}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/compare?domains=${domain.id}`}>
            <Button variant="outline" data-testid="button-compare-domain">
              <GitCompare className="mr-2 h-4 w-4" />
              Compare
            </Button>
          </Link>
          <Link href={`/visualizations?domain=${domain.id}`}>
            <Button data-testid="button-view-charts">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Charts
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sub-domains
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{domain.subdomains?.length ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Roles
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {domain.subdomains?.reduce((acc, sd) => acc + (sd.roles?.length ?? 0), 0) ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Companies
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{domain.companies?.length ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Salary Range
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salaryRange
                ? `${(salaryRange.min / 1000).toFixed(0)}K-${(salaryRange.max / 1000).toFixed(0)}K`
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">AED/month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Sub-domains & Roles</CardTitle>
              <CardDescription>
                Explore specialized areas and career opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {domain.subdomains && domain.subdomains.length > 0 ? (
                <Accordion type="multiple" className="w-full">
                  {domain.subdomains.map((subdomain) => (
                    <AccordionItem key={subdomain.id} value={`subdomain-${subdomain.id}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{subdomain.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {subdomain.roles?.length ?? 0} roles
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          <p className="text-sm text-muted-foreground">
                            {subdomain.description}
                          </p>
                          {subdomain.roles && subdomain.roles.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">Roles</h4>
                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {subdomain.roles.map((role) => (
                                  <div
                                    key={role.id}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                  >
                                    <span className="text-sm">{role.name}</span>
                                    <Badge
                                      variant={
                                        role.level === "EXECUTIVE"
                                          ? "default"
                                          : role.level === "SENIOR"
                                          ? "secondary"
                                          : "outline"
                                      }
                                      className="text-xs"
                                    >
                                      {role.level}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No sub-domains available for this domain.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Top Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              {domain.companies && domain.companies.length > 0 ? (
                <div className="space-y-3">
                  {domain.companies.slice(0, 6).map((company) => (
                    <div
                      key={company.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <div className="font-medium">{company.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {company.description}
                        </div>
                      </div>
                      {company.website && (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No companies listed yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/visualizations?category=salary&domain=${domain.id}`}>
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="mr-2 h-4 w-4" />
                  View Salary Data
                </Button>
              </Link>
              <Link href={`/visualizations?category=certifications&domain=${domain.id}`}>
                <Button variant="outline" className="w-full justify-start">
                  <Award className="mr-2 h-4 w-4" />
                  View Certifications
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
