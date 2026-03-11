import { Link, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Truck,
  Ship,
  Plane,
  Train,
  Anchor,
  Package,
  FileCheck,
  Warehouse,
  Building2,
  Box,
  Mail,
  ShoppingCart,
  Snowflake,
  Wrench,
  Factory,
  MapPin,
  ClipboardList,
  Cpu,
  ArrowRight,
  Search,
  Users,
  Briefcase,
} from "lucide-react";
import { useState } from "react";
import type { Domain } from "@shared/schema";

const domainIcons: Record<string, React.ElementType> = {
  truck: Truck,
  ship: Ship,
  plane: Plane,
  train: Train,
  anchor: Anchor,
  package: Package,
  "file-check": FileCheck,
  warehouse: Warehouse,
  building: Building2,
  box: Box,
  mail: Mail,
  cart: ShoppingCart,
  snowflake: Snowflake,
  wrench: Wrench,
  factory: Factory,
  "map-pin": MapPin,
  clipboard: ClipboardList,
  cpu: Cpu,
  default: Package,
};

interface DomainWithCounts extends Domain {
  subdomainCount?: number;
  roleCount?: number;
  companies?: string[];
}

export default function DomainsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const searchParams = useSearch();
  const industryId = new URLSearchParams(searchParams).get("industry");

  const { data: domains, isLoading } = useQuery<DomainWithCounts[]>({
    queryKey: ["/api/domains", industryId],
    queryFn: async () => {
      const url = industryId ? `/api/domains?industry=${industryId}` : "/api/domains";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch domains");
      return res.json();
    },
  });

  const filteredDomains = (domains || []).filter((domain) =>
    domain.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Supply Chain & Logistics Domains
          </h1>
          <p className="mt-1 text-muted-foreground">
            Explore 18 specialized domains within the UAE supply chain industry
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search domains..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-domains"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? (
          <>
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <Skeleton className="mt-4 h-6 w-3/4" />
                  <Skeleton className="mt-2 h-4 w-full" />
                  <Skeleton className="mt-1 h-4 w-2/3" />
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : filteredDomains.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <Package className="mb-4 h-16 w-16 text-muted-foreground/50" />
            <h3 className="text-lg font-medium">No domains found</h3>
            <p className="mt-1 text-muted-foreground">
              Try adjusting your search query
            </p>
          </div>
        ) : (
          filteredDomains.map((domain) => {
            const IconComponent = domainIcons[domain.icon] || domainIcons.default;
            return (
              <Card
                key={domain.id}
                className="group overflow-hidden transition-all hover:shadow-lg"
                data-testid={`card-domain-${domain.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-4 line-clamp-1">{domain.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {domain.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex flex-wrap gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Briefcase className="h-3 w-3" />
                      {domain.subdomainCount ?? 3} Sub-domains
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Users className="h-3 w-3" />
                      {domain.roleCount ?? 8} Roles
                    </Badge>
                  </div>
                  {domain.companies && domain.companies.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-1">
                      {domain.companies.slice(0, 3).map((company) => (
                        <Badge
                          key={company}
                          variant="outline"
                          className="text-xs"
                        >
                          {company}
                        </Badge>
                      ))}
                      {domain.companies.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{domain.companies.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  <Link href={`/domains/${domain.id}`}>
                    <Button
                      className="w-full"
                      variant="outline"
                      data-testid={`button-view-domain-${domain.id}`}
                    >
                      Explore Domain
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
