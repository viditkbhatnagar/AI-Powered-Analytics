import { db } from "./db";
import { eq, sql, desc, and, inArray } from "drizzle-orm";
import {
  industries,
  domains,
  subdomains,
  roles,
  salaries,
  initiatives,
  certifications,
  roleCertifications,
  companies,
  domainCompanies,
  dashboards,
  settings,
  users,
  type Industry,
  type Domain,
  type Subdomain,
  type Role,
  type Salary,
  type Initiative,
  type Certification,
  type Company,
  type Dashboard,
  type Settings,
  type User,
  type InsertIndustry,
  type InsertDomain,
  type InsertSubdomain,
  type InsertRole,
  type InsertSalary,
  type InsertInitiative,
  type InsertCertification,
  type InsertCompany,
  type InsertDashboard,
  type InsertSettings,
  type InsertUser,
  type DashboardConfig,
} from "@shared/schema";

export interface IStorage {
  // Industries
  getAllIndustries(): Promise<Industry[]>;
  getIndustryById(id: number): Promise<Industry | undefined>;
  createIndustry(data: InsertIndustry): Promise<Industry>;

  // Domains
  getAllDomains(industryId?: number): Promise<(Domain & { subdomainCount?: number; roleCount?: number; companies?: string[] })[]>;
  getDomainById(id: number): Promise<Domain & { subdomains?: (Subdomain & { roles?: Role[] })[]; companies?: Company[]; salaries?: Salary[] } | undefined>;
  createDomain(data: InsertDomain): Promise<Domain>;

  // Subdomains
  getSubdomainById(id: number): Promise<Subdomain & { roles?: Role[] } | undefined>;
  createSubdomain(data: InsertSubdomain): Promise<Subdomain>;

  // Roles
  getAllRoles(domainId?: number): Promise<Role[]>;
  createRole(data: InsertRole): Promise<Role>;

  // Salaries
  getAllSalaries(domainId?: number): Promise<Salary[]>;
  getSalaryStats(): Promise<{ domain: string; minSalary: number; maxSalary: number; avgSalary: number }[]>;
  createSalary(data: InsertSalary): Promise<Salary>;

  // Initiatives
  getAllInitiatives(): Promise<Initiative[]>;
  createInitiative(data: InsertInitiative): Promise<Initiative>;

  // Certifications
  getAllCertifications(domainId?: number): Promise<Certification[]>;
  createCertification(data: InsertCertification): Promise<Certification>;

  // Companies
  getAllCompanies(domainId?: number): Promise<Company[]>;
  createCompany(data: InsertCompany): Promise<Company>;
  linkCompanyToDomain(companyId: number, domainId: number): Promise<void>;

  // Dashboards
  getAllDashboards(): Promise<Dashboard[]>;
  getDashboardById(id: number): Promise<Dashboard | undefined>;
  createDashboard(data: InsertDashboard): Promise<Dashboard>;
  updateDashboard(id: number, data: Partial<InsertDashboard>): Promise<Dashboard | undefined>;
  deleteDashboard(id: number): Promise<void>;
  deleteAllDashboards(): Promise<void>;

  // Settings
  getSettings(): Promise<Settings | undefined>;
  updateSettings(data: Partial<InsertSettings>): Promise<Settings>;

  // Stats
  getStats(): Promise<{ domainCount: number; roleCount: number; chartCount: number }>;

  // Users (existing)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  // Industries
  async getAllIndustries(): Promise<Industry[]> {
    return db.select().from(industries).orderBy(industries.name);
  }

  async getIndustryById(id: number): Promise<Industry | undefined> {
    const [industry] = await db.select().from(industries).where(eq(industries.id, id));
    return industry;
  }

  async createIndustry(data: InsertIndustry): Promise<Industry> {
    const [industry] = await db.insert(industries).values(data).returning();
    return industry;
  }

  // Domains
  async getAllDomains(industryId?: number): Promise<(Domain & { subdomainCount?: number; roleCount?: number; companies?: string[] })[]> {
    const query = industryId 
      ? db.select().from(domains).where(eq(domains.industryId, industryId))
      : db.select().from(domains);
    
    const domainList = await query.orderBy(domains.name);

    const result = await Promise.all(
      domainList.map(async (domain) => {
        const subdomainList = await db.select().from(subdomains).where(eq(subdomains.domainId, domain.id));
        const roleCount = await Promise.all(
          subdomainList.map(async (sd) => {
            const roleList = await db.select().from(roles).where(eq(roles.subdomainId, sd.id));
            return roleList.length;
          })
        );
        const companyLinks = await db.select().from(domainCompanies).where(eq(domainCompanies.domainId, domain.id));
        const companyList = await Promise.all(
          companyLinks.map(async (link) => {
            const [company] = await db.select().from(companies).where(eq(companies.id, link.companyId));
            return company?.name;
          })
        );

        return {
          ...domain,
          subdomainCount: subdomainList.length,
          roleCount: roleCount.reduce((a, b) => a + b, 0),
          companies: companyList.filter(Boolean) as string[],
        };
      })
    );

    return result;
  }

  async getDomainById(id: number): Promise<Domain & { subdomains?: (Subdomain & { roles?: Role[] })[]; companies?: Company[]; salaries?: Salary[] } | undefined> {
    const [domain] = await db.select().from(domains).where(eq(domains.id, id));
    if (!domain) return undefined;

    const subdomainList = await db.select().from(subdomains).where(eq(subdomains.domainId, id));
    const subdomainsWithRoles = await Promise.all(
      subdomainList.map(async (sd) => {
        const roleList = await db.select().from(roles).where(eq(roles.subdomainId, sd.id));
        return { ...sd, roles: roleList };
      })
    );

    const companyLinks = await db.select().from(domainCompanies).where(eq(domainCompanies.domainId, id));
    const companyList = await Promise.all(
      companyLinks.map(async (link) => {
        const [company] = await db.select().from(companies).where(eq(companies.id, link.companyId));
        return company;
      })
    );

    const salaryList = await db.select().from(salaries).where(eq(salaries.domainId, id));

    return {
      ...domain,
      subdomains: subdomainsWithRoles,
      companies: companyList.filter(Boolean) as Company[],
      salaries: salaryList,
    };
  }

  async createDomain(data: InsertDomain): Promise<Domain> {
    const [domain] = await db.insert(domains).values(data).returning();
    return domain;
  }

  // Subdomains
  async getSubdomainById(id: number): Promise<Subdomain & { roles?: Role[] } | undefined> {
    const [subdomain] = await db.select().from(subdomains).where(eq(subdomains.id, id));
    if (!subdomain) return undefined;

    const roleList = await db.select().from(roles).where(eq(roles.subdomainId, id));
    return { ...subdomain, roles: roleList };
  }

  async createSubdomain(data: InsertSubdomain): Promise<Subdomain> {
    const [subdomain] = await db.insert(subdomains).values(data).returning();
    return subdomain;
  }

  // Roles
  async getAllRoles(domainId?: number): Promise<Role[]> {
    if (domainId) {
      const subdomainList = await db.select().from(subdomains).where(eq(subdomains.domainId, domainId));
      const subdomainIds = subdomainList.map((sd) => sd.id);
      if (subdomainIds.length === 0) return [];
      return db.select().from(roles).where(inArray(roles.subdomainId, subdomainIds));
    }
    return db.select().from(roles);
  }

  async createRole(data: InsertRole): Promise<Role> {
    const [role] = await db.insert(roles).values(data).returning();
    return role;
  }

  // Salaries
  async getAllSalaries(domainId?: number): Promise<Salary[]> {
    if (domainId) {
      return db.select().from(salaries).where(eq(salaries.domainId, domainId));
    }
    return db.select().from(salaries);
  }

  async getSalaryStats(): Promise<{ domain: string; minSalary: number; maxSalary: number; avgSalary: number }[]> {
    const result = await db
      .select({
        domainId: salaries.domainId,
        minSalary: sql<number>`MIN(${salaries.minSalary})`,
        maxSalary: sql<number>`MAX(${salaries.maxSalary})`,
        avgSalary: sql<number>`AVG((${salaries.minSalary} + ${salaries.maxSalary}) / 2)`,
      })
      .from(salaries)
      .groupBy(salaries.domainId);

    const domainIds = result.map((r) => r.domainId);
    const domainList = await db.select().from(domains).where(inArray(domains.id, domainIds));
    const domainMap = new Map(domainList.map((d) => [d.id, d.name]));

    return result.map((r) => ({
      domain: domainMap.get(r.domainId) || `Domain ${r.domainId}`,
      minSalary: r.minSalary,
      maxSalary: r.maxSalary,
      avgSalary: Math.round(r.avgSalary),
    }));
  }

  async createSalary(data: InsertSalary): Promise<Salary> {
    const [salary] = await db.insert(salaries).values(data).returning();
    return salary;
  }

  // Initiatives
  async getAllInitiatives(): Promise<Initiative[]> {
    return db.select().from(initiatives).orderBy(initiatives.timeframeStart);
  }

  async createInitiative(data: InsertInitiative): Promise<Initiative> {
    const [initiative] = await db.insert(initiatives).values(data).returning();
    return initiative;
  }

  // Certifications
  async getAllCertifications(domainId?: number): Promise<Certification[]> {
    // For now, return all certifications; domain filtering would require role-certification links
    return db.select().from(certifications).orderBy(certifications.name);
  }

  async createCertification(data: InsertCertification): Promise<Certification> {
    const [certification] = await db.insert(certifications).values(data).returning();
    return certification;
  }

  // Companies
  async getAllCompanies(domainId?: number): Promise<Company[]> {
    if (domainId) {
      const links = await db.select().from(domainCompanies).where(eq(domainCompanies.domainId, domainId));
      const companyIds = links.map((l) => l.companyId);
      if (companyIds.length === 0) return [];
      return db.select().from(companies).where(inArray(companies.id, companyIds));
    }
    return db.select().from(companies).orderBy(companies.name);
  }

  async createCompany(data: InsertCompany): Promise<Company> {
    const [company] = await db.insert(companies).values(data).returning();
    return company;
  }

  async linkCompanyToDomain(companyId: number, domainId: number): Promise<void> {
    await db.insert(domainCompanies).values({ companyId, domainId }).onConflictDoNothing();
  }

  // Dashboards
  async getAllDashboards(): Promise<Dashboard[]> {
    return db.select().from(dashboards).orderBy(desc(dashboards.updatedAt));
  }

  async getDashboardById(id: number): Promise<Dashboard | undefined> {
    const [dashboard] = await db.select().from(dashboards).where(eq(dashboards.id, id));
    return dashboard;
  }

  async createDashboard(data: InsertDashboard): Promise<Dashboard> {
    const [dashboard] = await db.insert(dashboards).values(data).returning();
    return dashboard;
  }

  async updateDashboard(id: number, data: Partial<InsertDashboard>): Promise<Dashboard | undefined> {
    const [dashboard] = await db
      .update(dashboards)
      .set({ ...data, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(dashboards.id, id))
      .returning();
    return dashboard;
  }

  async deleteDashboard(id: number): Promise<void> {
    await db.delete(dashboards).where(eq(dashboards.id, id));
  }

  async deleteAllDashboards(): Promise<void> {
    await db.delete(dashboards);
  }

  // Settings
  async getSettings(): Promise<Settings | undefined> {
    const [setting] = await db.select().from(settings).limit(1);
    return setting;
  }

  async updateSettings(data: Partial<InsertSettings>): Promise<Settings> {
    const existing = await this.getSettings();
    if (existing) {
      const [updated] = await db
        .update(settings)
        .set({ ...data, updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(eq(settings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(settings).values(data as InsertSettings).returning();
      return created;
    }
  }

  // Stats
  async getStats(): Promise<{ domainCount: number; roleCount: number; chartCount: number }> {
    const [domainResult] = await db.select({ count: sql<number>`COUNT(*)` }).from(domains);
    const [roleResult] = await db.select({ count: sql<number>`COUNT(*)` }).from(roles);
    return {
      domainCount: Number(domainResult?.count) || 18,
      roleCount: Number(roleResult?.count) || 150,
      chartCount: 30,
    };
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(data: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }
}

export const storage = new DatabaseStorage();
