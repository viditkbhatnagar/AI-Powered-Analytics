export type RoleLevel = "ENTRY" | "MID" | "SENIOR" | "EXECUTIVE";

export interface SalaryBand {
  min: number;
  max: number;
}

export interface IndustryPack {
  industry: {
    name: string;
    description: string;
    icon: string;
  };
  domains: Array<{
    name: string;
    icon: string;
    description: string;
  }>;
  // domainName -> subdomain names
  subdomains: Record<string, string[]>;
  // subdomainName -> 4 role names ordered [ENTRY, MID, SENIOR, EXECUTIVE]
  sampleRoles: Record<string, [string, string, string, string]>;
  // domainName -> per-level salary bands. Units follow `salaryCurrency`:
  //   AED  -> monthly amount in AED
  //   INR  -> annual amount in INR (rupees, not lakhs)
  salaryBands: Record<string, Record<RoleLevel, SalaryBand>>;
  salaryCurrency: "AED" | "INR";
  salarySource: string;
  initiatives: Array<{
    scope: string;
    name: string;
    domainsImpacted: string[];
    timeframeStart: number;
    timeframeEnd: number;
    kpiTarget: string;
    category: string;
    sourceUrl: string;
  }>;
  // Certifications pinned to this industry (industryId set).
  // Cross-industry certs (PMP, Lean Six Sigma) live in shared-certifications.ts and are seeded with industryId=null.
  certifications: Array<{
    name: string;
    provider: string;
    description: string;
    benefits: string;
    url: string;
    cost?: number;
    durationMonths?: number;
  }>;
  companies: Array<{
    name: string;
    description: string;
    website: string;
    domains: string[];
  }>;
}
