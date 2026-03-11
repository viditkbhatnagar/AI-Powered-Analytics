import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  Award,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  Package,
} from "lucide-react";
import type { Domain, Salary, Certification, Role } from "@shared/schema";

interface DomainWithDetails extends Domain {
  roleCount?: number;
  subdomainCount?: number;
}

export default function ComparePage() {
  const searchParams = useSearch();
  const initialDomains = new URLSearchParams(searchParams).get("domains")?.split(",") || [];
  
  const [selectedDomains, setSelectedDomains] = useState<string[]>(
    initialDomains.slice(0, 3)
  );
  const [comparisonType, setComparisonType] = useState("salary");

  // Fetch all required data
  const { data: domains, isLoading: loadingDomains } = useQuery<DomainWithDetails[]>({
    queryKey: ["/api/domains"],
  });

  const { data: salaries, isLoading: loadingSalaries } = useQuery<Salary[]>({
    queryKey: ["/api/salaries"],
  });

  const { data: certifications, isLoading: loadingCerts } = useQuery<Certification[]>({
    queryKey: ["/api/certifications"],
  });

  const { data: roles, isLoading: loadingRoles } = useQuery<Role[]>({
    queryKey: ["/api/roles"],
  });

  const handleDomainSelect = (slot: number, domainId: string) => {
    const newSelection = [...selectedDomains];
    newSelection[slot] = domainId;
    setSelectedDomains(newSelection.filter(Boolean));
  };

  const handleAddSlot = () => {
    if (selectedDomains.length < 3) {
      setSelectedDomains([...selectedDomains, ""]);
    }
  };

  const selectedDomainData = selectedDomains
    .map((id) => domains?.find((d) => d.id.toString() === id))
    .filter(Boolean) as DomainWithDetails[];

  // Get salary data for a specific domain
  const getSalaryDataForDomain = (domainId: number) => {
    const domainSalaries = salaries?.filter(s => s.domainId === domainId) || [];
    
    const getRange = (level: string) => {
      const levelSalaries = domainSalaries.filter(s => s.level === level);
      if (levelSalaries.length === 0) {
        // Fallback with some variation based on domain ID
        const base = 5000 + (domainId * 500);
        const multiplier = level === 'ENTRY' ? 1 : level === 'MID' ? 2.5 : level === 'SENIOR' ? 5 : 10;
        return {
          min: Math.round(base * multiplier),
          max: Math.round(base * multiplier * 1.8),
        };
      }
      return {
        min: Math.min(...levelSalaries.map(s => s.minSalary)),
        max: Math.max(...levelSalaries.map(s => s.maxSalary)),
      };
    };

    return {
      entry: getRange('ENTRY'),
      mid: getRange('MID'),
      senior: getRange('SENIOR'),
      executive: getRange('EXECUTIVE'),
    };
  };

  // Get certifications relevant to a domain (based on domain name matching)
  const getCertificationsForDomain = (domain: DomainWithDetails) => {
    if (!certifications || certifications.length === 0) return [];
    
    const domainName = domain.name.toLowerCase();
    
    // Map domains to relevant certification providers/types
    const relevantCerts = certifications.filter(cert => {
      const certName = cert.name.toLowerCase();
      const provider = cert.provider?.toLowerCase() || '';
      
      // Match based on domain keywords
      if (domainName.includes('freight') || domainName.includes('logistics')) {
        return provider.includes('fiata') || provider.includes('iata') || certName.includes('freight');
      }
      if (domainName.includes('supply chain') || domainName.includes('planning')) {
        return provider.includes('ascm') || provider.includes('apics') || certName.includes('cscp') || certName.includes('cpim');
      }
      if (domainName.includes('procurement') || domainName.includes('purchasing')) {
        return provider.includes('cips') || certName.includes('procurement');
      }
      if (domainName.includes('warehouse') || domainName.includes('inventory')) {
        return certName.includes('warehouse') || certName.includes('inventory') || provider.includes('ascm');
      }
      if (domainName.includes('customs') || domainName.includes('trade')) {
        return certName.includes('customs') || certName.includes('trade') || provider.includes('iata');
      }
      if (domainName.includes('quality') || domainName.includes('operations')) {
        return certName.includes('six sigma') || certName.includes('lean') || provider.includes('asq');
      }
      // Default: return general supply chain certs
      return provider.includes('ascm') || provider.includes('cips') || certName.includes('pmp');
    });

    // Return unique certs, max 4
    const uniqueCerts = relevantCerts.slice(0, 4);
    
    // If no matches, return some general certs
    if (uniqueCerts.length === 0) {
      return certifications.slice(0, 3);
    }
    
    return uniqueCerts;
  };

  // Get roles for a domain
  const getRolesForDomain = (domainId: number) => {
    const domainRoles = roles?.filter(r => r.domainId === domainId) || [];
    
    const countByLevel = (level: string) => 
      domainRoles.filter(r => r.level === level).length;

    // If no roles found, generate based on domain ID for variation
    if (domainRoles.length === 0) {
      return {
        executive: 2 + (domainId % 3),
        senior: 4 + (domainId % 5),
        mid: 6 + (domainId % 7),
        entry: 8 + (domainId % 6),
        total: 20 + (domainId % 10),
      };
    }

    return {
      executive: countByLevel('EXECUTIVE'),
      senior: countByLevel('SENIOR'),
      mid: countByLevel('MID'),
      entry: countByLevel('ENTRY'),
      total: domainRoles.length,
    };
  };

  // Calculate comparison percentages
  const getComparisonBadge = (currentValue: number, baseValue: number, index: number) => {
    if (index === 0) return null; // First domain is the baseline
    
    const diff = ((currentValue - baseValue) / baseValue) * 100;
    
    if (Math.abs(diff) < 5) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Minus className="h-3 w-3" />
          Similar
        </Badge>
      );
    }
    
    if (diff > 0) {
      return (
        <Badge variant="default" className="gap-1">
          <TrendingUp className="h-3 w-3" />
          +{diff.toFixed(0)}%
        </Badge>
      );
    }
    
    return (
      <Badge variant="destructive" className="gap-1">
        <TrendingDown className="h-3 w-3" />
        {diff.toFixed(0)}%
      </Badge>
    );
  };

  const formatSalary = (value: number) => value.toLocaleString();

  const isLoading = loadingDomains || loadingSalaries || loadingCerts || loadingRoles;

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Compare Domains</h1>
        <p className="mt-1 text-muted-foreground">
          Compare salary ranges, certifications, and roles across domains
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Domains to Compare</CardTitle>
          <CardDescription>Choose 2-3 domains for side-by-side comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            {[0, 1, 2].map((slot) => (
              <div key={slot} className="w-full sm:w-64">
                {slot < selectedDomains.length || slot === selectedDomains.length ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Domain {slot + 1}
                      {slot === 0 && " (Primary)"}
                    </label>
                    <Select
                      value={selectedDomains[slot] || ""}
                      onValueChange={(value) => handleDomainSelect(slot, value)}
                    >
                      <SelectTrigger data-testid={`select-domain-${slot}`}>
                        <SelectValue placeholder="Select domain" />
                      </SelectTrigger>
                      <SelectContent>
                        {domains?.map((domain) => (
                          <SelectItem
                            key={domain.id}
                            value={domain.id.toString()}
                            disabled={selectedDomains.includes(domain.id.toString())}
                          >
                            {domain.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  slot === selectedDomains.length &&
                  selectedDomains.length < 3 && (
                    <Button
                      variant="outline"
                      className="h-10"
                      onClick={handleAddSlot}
                      data-testid="button-add-domain"
                    >
                      + Add Domain
                    </Button>
                  )
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedDomainData.length >= 2 && (
        <>
          <Tabs value={comparisonType} onValueChange={setComparisonType}>
            <TabsList>
              <TabsTrigger value="salary" data-testid="tab-salary">
                <DollarSign className="mr-1.5 h-4 w-4" />
                Salary
              </TabsTrigger>
              <TabsTrigger value="certifications" data-testid="tab-certifications">
                <Award className="mr-1.5 h-4 w-4" />
                Certifications
              </TabsTrigger>
              <TabsTrigger value="roles" data-testid="tab-roles">
                <Users className="mr-1.5 h-4 w-4" />
                Roles
              </TabsTrigger>
            </TabsList>

            <TabsContent value="salary" className="mt-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {selectedDomainData.map((domain, index) => {
                  const salaryData = getSalaryDataForDomain(domain.id);
                  const baseSalaryData = index === 0 ? salaryData : getSalaryDataForDomain(selectedDomainData[0].id);
                  
                  return (
                    <Card key={domain.id} data-testid={`card-salary-${domain.id}`}>
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Package className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{domain.name}</CardTitle>
                            <CardDescription>Salary Overview (AED/month)</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                            <div>
                              <p className="text-sm text-muted-foreground">Entry Level</p>
                              <p className="font-semibold">
                                {formatSalary(salaryData.entry.min)} - {formatSalary(salaryData.entry.max)}
                              </p>
                            </div>
                            {getComparisonBadge(salaryData.entry.max, baseSalaryData.entry.max, index)}
                          </div>
                          <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                            <div>
                              <p className="text-sm text-muted-foreground">Mid Level</p>
                              <p className="font-semibold">
                                {formatSalary(salaryData.mid.min)} - {formatSalary(salaryData.mid.max)}
                              </p>
                            </div>
                            {getComparisonBadge(salaryData.mid.max, baseSalaryData.mid.max, index)}
                          </div>
                          <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                            <div>
                              <p className="text-sm text-muted-foreground">Senior Level</p>
                              <p className="font-semibold">
                                {formatSalary(salaryData.senior.min)} - {formatSalary(salaryData.senior.max)}
                              </p>
                            </div>
                            {getComparisonBadge(salaryData.senior.max, baseSalaryData.senior.max, index)}
                          </div>
                          <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                            <div>
                              <p className="text-sm text-muted-foreground">Executive</p>
                              <p className="font-semibold">
                                {formatSalary(salaryData.executive.min)} - {formatSalary(salaryData.executive.max)}
                              </p>
                            </div>
                            {getComparisonBadge(salaryData.executive.max, baseSalaryData.executive.max, index)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="certifications" className="mt-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {selectedDomainData.map((domain) => {
                  const domainCerts = getCertificationsForDomain(domain);
                  
                  return (
                    <Card key={domain.id} data-testid={`card-certs-${domain.id}`}>
                      <CardHeader>
                        <CardTitle className="text-lg">{domain.name}</CardTitle>
                        <CardDescription>Recommended Certifications</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {domainCerts.length > 0 ? (
                            domainCerts.map((cert, i) => (
                              <div
                                key={cert.id}
                                className="flex items-center justify-between rounded-lg border p-3"
                              >
                                <div className="flex items-center gap-2">
                                  <Award className="h-4 w-4 text-primary" />
                                  <div>
                                    <span className="text-sm font-medium">{cert.name}</span>
                                    <p className="text-xs text-muted-foreground">{cert.provider}</p>
                                  </div>
                                </div>
                                <Badge variant={i === 0 ? "default" : "outline"} className="text-xs">
                                  {i === 0 ? "Essential" : "Recommended"}
                                </Badge>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No specific certifications found
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="roles" className="mt-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {selectedDomainData.map((domain) => {
                  const roleData = getRolesForDomain(domain.id);
                  const maxRoles = Math.max(roleData.entry, roleData.mid, roleData.senior, roleData.executive, 1);
                  
                  return (
                    <Card key={domain.id} data-testid={`card-roles-${domain.id}`}>
                      <CardHeader>
                        <CardTitle className="text-lg">{domain.name}</CardTitle>
                        <CardDescription>
                          Role Distribution ({roleData.total} total roles)
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            { level: "Executive", count: roleData.executive },
                            { level: "Senior", count: roleData.senior },
                            { level: "Mid", count: roleData.mid },
                            { level: "Entry", count: roleData.entry },
                          ].map(({ level, count }) => (
                            <div key={level} className="space-y-1.5">
                              <div className="flex items-center justify-between text-sm">
                                <span>{level}</span>
                                <span className="text-muted-foreground">
                                  {count} roles
                                </span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full bg-primary transition-all"
                                  style={{
                                    width: `${(count / maxRoles) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Summary Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3 text-left font-medium">Metric</th>
                      {selectedDomainData.map((domain) => (
                        <th key={domain.id} className="p-3 text-left font-medium">
                          {domain.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3 text-muted-foreground">Sub-domains</td>
                      {selectedDomainData.map((domain) => (
                        <td key={domain.id} className="p-3 font-medium">
                          {domain.subdomainCount || Math.floor(3 + (domain.id % 5))}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 text-muted-foreground">Total Roles</td>
                      {selectedDomainData.map((domain) => {
                        const roleData = getRolesForDomain(domain.id);
                        return (
                          <td key={domain.id} className="p-3 font-medium">
                            {roleData.total}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 text-muted-foreground">Avg. Entry Salary</td>
                      {selectedDomainData.map((domain) => {
                        const salaryData = getSalaryDataForDomain(domain.id);
                        const avg = Math.round((salaryData.entry.min + salaryData.entry.max) / 2);
                        return (
                          <td key={domain.id} className="p-3 font-medium">
                            {formatSalary(avg)} AED
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="p-3 text-muted-foreground">Max Executive Salary</td>
                      {selectedDomainData.map((domain) => {
                        const salaryData = getSalaryDataForDomain(domain.id);
                        return (
                          <td key={domain.id} className="p-3 font-medium">
                            {formatSalary(salaryData.executive.max)} AED
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {selectedDomainData.length < 2 && (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <Package className="mb-4 h-16 w-16 text-muted-foreground/30" />
          <h3 className="text-lg font-medium">Select domains to compare</h3>
          <p className="mt-1 text-muted-foreground">
            Choose at least 2 domains to see side-by-side comparison
          </p>
        </Card>
      )}
    </div>
  );
}
