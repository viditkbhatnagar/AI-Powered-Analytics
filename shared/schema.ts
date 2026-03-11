import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export chat models
export * from "./models/chat";

// ============ INDUSTRIES ============
export const industries = pgTable("industries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  isPreloaded: boolean("is_preloaded").default(false).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const industriesRelations = relations(industries, ({ many }) => ({
  domains: many(domains),
}));

export const insertIndustrySchema = createInsertSchema(industries).omit({
  id: true,
  createdAt: true,
});
export type Industry = typeof industries.$inferSelect;
export type InsertIndustry = z.infer<typeof insertIndustrySchema>;

// ============ DOMAINS ============
export const domains = pgTable("domains", {
  id: serial("id").primaryKey(),
  industryId: integer("industry_id").notNull().references(() => industries.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const domainsRelations = relations(domains, ({ one, many }) => ({
  industry: one(industries, {
    fields: [domains.industryId],
    references: [industries.id],
  }),
  subdomains: many(subdomains),
  salaries: many(salaries),
  domainCompanies: many(domainCompanies),
}));

export const insertDomainSchema = createInsertSchema(domains).omit({
  id: true,
  createdAt: true,
});
export type Domain = typeof domains.$inferSelect;
export type InsertDomain = z.infer<typeof insertDomainSchema>;

// ============ SUBDOMAINS ============
export const subdomains = pgTable("subdomains", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").notNull().references(() => domains.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const subdomainsRelations = relations(subdomains, ({ one, many }) => ({
  domain: one(domains, {
    fields: [subdomains.domainId],
    references: [domains.id],
  }),
  roles: many(roles),
}));

export const insertSubdomainSchema = createInsertSchema(subdomains).omit({
  id: true,
  createdAt: true,
});
export type Subdomain = typeof subdomains.$inferSelect;
export type InsertSubdomain = z.infer<typeof insertSubdomainSchema>;

// ============ ROLES ============
export const roleLevel = ["ENTRY", "MID", "SENIOR", "EXECUTIVE"] as const;

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  subdomainId: integer("subdomain_id").notNull().references(() => subdomains.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  level: text("level").notNull().$type<typeof roleLevel[number]>(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const rolesRelations = relations(roles, ({ one, many }) => ({
  subdomain: one(subdomains, {
    fields: [roles.subdomainId],
    references: [subdomains.id],
  }),
  roleCertifications: many(roleCertifications),
}));

export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
});
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;

// ============ SALARIES ============
export const salaries = pgTable("salaries", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").notNull().references(() => domains.id, { onDelete: "cascade" }),
  subdomainId: integer("subdomain_id").references(() => subdomains.id, { onDelete: "set null" }),
  roleLevel: text("role_level").notNull().$type<typeof roleLevel[number]>(),
  minSalary: integer("min_salary").notNull(),
  maxSalary: integer("max_salary").notNull(),
  currency: text("currency").default("AED").notNull(),
  source: text("source").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const salariesRelations = relations(salaries, ({ one }) => ({
  domain: one(domains, {
    fields: [salaries.domainId],
    references: [domains.id],
  }),
  subdomain: one(subdomains, {
    fields: [salaries.subdomainId],
    references: [subdomains.id],
  }),
}));

export const insertSalarySchema = createInsertSchema(salaries).omit({
  id: true,
  createdAt: true,
});
export type Salary = typeof salaries.$inferSelect;
export type InsertSalary = z.infer<typeof insertSalarySchema>;

// ============ INITIATIVES (CO1) ============
export const initiatives = pgTable("initiatives", {
  id: serial("id").primaryKey(),
  scope: text("scope").notNull(),
  name: text("name").notNull(),
  domainsImpacted: text("domains_impacted").array().notNull(),
  timeframeStart: integer("timeframe_start").notNull(),
  timeframeEnd: integer("timeframe_end").notNull(),
  kpiTarget: text("kpi_target").notNull(),
  sourceUrl: text("source_url").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertInitiativeSchema = createInsertSchema(initiatives).omit({
  id: true,
  createdAt: true,
});
export type Initiative = typeof initiatives.$inferSelect;
export type InsertInitiative = z.infer<typeof insertInitiativeSchema>;

// ============ CERTIFICATIONS ============
export const certifications = pgTable("certifications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  provider: text("provider").notNull(),
  description: text("description").notNull(),
  benefits: text("benefits").notNull(),
  url: text("url").notNull(),
  cost: integer("cost"),
  durationMonths: integer("duration_months"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertCertificationSchema = createInsertSchema(certifications).omit({
  id: true,
  createdAt: true,
});
export type Certification = typeof certifications.$inferSelect;
export type InsertCertification = z.infer<typeof insertCertificationSchema>;

// ============ ROLE CERTIFICATIONS (Junction) ============
export const roleCertifications = pgTable("role_certifications", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  certificationId: integer("certification_id").notNull().references(() => certifications.id, { onDelete: "cascade" }),
  isRecommended: boolean("is_recommended").default(false).notNull(),
});

export const roleCertificationsRelations = relations(roleCertifications, ({ one }) => ({
  role: one(roles, {
    fields: [roleCertifications.roleId],
    references: [roles.id],
  }),
  certification: one(certifications, {
    fields: [roleCertifications.certificationId],
    references: [certifications.id],
  }),
}));

export const insertRoleCertificationSchema = createInsertSchema(roleCertifications).omit({
  id: true,
});
export type RoleCertification = typeof roleCertifications.$inferSelect;
export type InsertRoleCertification = z.infer<typeof insertRoleCertificationSchema>;

// ============ COMPANIES ============
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  website: text("website").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
});
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

// ============ DOMAIN COMPANIES (Junction) ============
export const domainCompanies = pgTable("domain_companies", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").notNull().references(() => domains.id, { onDelete: "cascade" }),
  companyId: integer("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
});

export const domainCompaniesRelations = relations(domainCompanies, ({ one }) => ({
  domain: one(domains, {
    fields: [domainCompanies.domainId],
    references: [domains.id],
  }),
  company: one(companies, {
    fields: [domainCompanies.companyId],
    references: [companies.id],
  }),
}));

export const insertDomainCompanySchema = createInsertSchema(domainCompanies).omit({
  id: true,
});
export type DomainCompany = typeof domainCompanies.$inferSelect;
export type InsertDomainCompany = z.infer<typeof insertDomainCompanySchema>;

// ============ DASHBOARDS ============
export const dashboards = pgTable("dashboards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  config: jsonb("config").notNull().$type<DashboardConfig>(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export interface DashboardChart {
  id: string;
  chartType: string;
  dataSource: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  config: Record<string, unknown>;
}

export interface DashboardConfig {
  charts: DashboardChart[];
  colorScheme?: string;
}

export const insertDashboardSchema = createInsertSchema(dashboards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type Dashboard = typeof dashboards.$inferSelect;
export type InsertDashboard = z.infer<typeof insertDashboardSchema>;

// ============ SETTINGS ============
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  theme: text("theme").default("light").notNull(),
  colorScheme: text("color_scheme").default("blue").notNull(),
  preferences: jsonb("preferences").$type<Record<string, unknown>>(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});
export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

// ============ PREBUILT CHARTS METADATA ============
export const chartCategories = ["trends", "domains", "salary", "certifications"] as const;

export interface PrebuiltChart {
  id: string;
  name: string;
  description: string;
  category: typeof chartCategories[number];
  chartType: string;
  library: "plotly" | "echarts" | "recharts" | "d3";
  dataSource: string;
}

// ============ USERS (keeping existing) ============
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
