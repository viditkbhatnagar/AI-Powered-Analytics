import { db } from "../db";
import { eq, isNull, and, inArray } from "drizzle-orm";
import { initiatives, certifications, industries, companies } from "@shared/schema";
import { storage } from "../storage";
import type { IndustryPack, RoleLevel } from "./types";
import { uaeSupplyChainPack } from "./uae-supply-chain";
import { indiaAviationPack } from "./india-aviation";
import { indiaFashionRetailPack } from "./india-fashion-retail";
import { SHARED_CERTIFICATIONS } from "./shared-certifications";

const ROLE_LEVELS: RoleLevel[] = ["ENTRY", "MID", "SENIOR", "EXECUTIVE"];

// Order matters: the first pack here becomes the default landing industry (id=1 for fresh seeds).
const PACKS: IndustryPack[] = [uaeSupplyChainPack, indiaAviationPack, indiaFashionRetailPack];

async function seedIndustryPack(pack: IndustryPack): Promise<void> {
  console.log(`Seeding industry pack: ${pack.industry.name}`);

  const industry = await storage.createIndustry({
    name: pack.industry.name,
    description: pack.industry.description,
    icon: pack.industry.icon,
    isPreloaded: true,
  });

  const domainMap = new Map<string, number>();
  for (const d of pack.domains) {
    const domain = await storage.createDomain({
      industryId: industry.id,
      name: d.name,
      description: d.description,
      icon: d.icon,
    });
    domainMap.set(d.name, domain.id);
  }

  for (const [domainName, subs] of Object.entries(pack.subdomains)) {
    const domainId = domainMap.get(domainName);
    if (!domainId) continue;
    for (const subName of subs) {
      const subdomain = await storage.createSubdomain({
        domainId,
        name: subName,
        description: `${subName} operations and career paths within ${domainName}.`,
      });
      const roleNames = pack.sampleRoles[subName];
      if (roleNames) {
        for (let i = 0; i < ROLE_LEVELS.length && i < roleNames.length; i++) {
          await storage.createRole({
            subdomainId: subdomain.id,
            name: roleNames[i],
            level: ROLE_LEVELS[i],
          });
        }
      }
    }
  }

  for (const [domainName, domainId] of domainMap) {
    const bands = pack.salaryBands[domainName];
    if (!bands) continue;
    for (const level of ROLE_LEVELS) {
      const band = bands[level];
      if (!band) continue;
      await storage.createSalary({
        domainId,
        roleLevel: level,
        minSalary: band.min,
        maxSalary: band.max,
        currency: pack.salaryCurrency,
        source: pack.salarySource,
      });
    }
  }

  for (const init of pack.initiatives) {
    await db.insert(initiatives).values({
      industryId: industry.id,
      scope: init.scope,
      name: init.name,
      domainsImpacted: init.domainsImpacted,
      timeframeStart: init.timeframeStart,
      timeframeEnd: init.timeframeEnd,
      kpiTarget: init.kpiTarget,
      category: init.category,
      sourceUrl: init.sourceUrl,
    });
  }

  for (const cert of pack.certifications) {
    await db.insert(certifications).values({
      industryId: industry.id,
      name: cert.name,
      provider: cert.provider,
      description: cert.description,
      benefits: cert.benefits,
      url: cert.url,
      cost: cert.cost,
      durationMonths: cert.durationMonths,
    });
  }

  const companyNameToId = new Map<string, number>();
  for (const c of pack.companies) {
    // Reuse a company row if its name already exists (e.g. FedEx appears in multiple industries).
    const existing = await db.select().from(companies).where(eq(companies.name, c.name)).limit(1);
    let companyId: number;
    if (existing.length > 0) {
      companyId = existing[0].id;
    } else {
      const created = await storage.createCompany({
        name: c.name,
        description: c.description,
        website: c.website,
      });
      companyId = created.id;
    }
    companyNameToId.set(c.name, companyId);
    for (const dName of c.domains) {
      const dId = domainMap.get(dName);
      if (dId) await storage.linkCompanyToDomain(companyId, dId);
    }
  }

  console.log(`  ✓ ${pack.industry.name}: ${pack.domains.length} domains, ${pack.initiatives.length} initiatives, ${pack.certifications.length} certs, ${pack.companies.length} companies`);
}

async function backfillLegacyInitiatives(): Promise<void> {
  const orphans = await db.select().from(initiatives).where(isNull(initiatives.industryId));
  if (orphans.length === 0) return;

  const uae = await db.select().from(industries).where(eq(industries.name, uaeSupplyChainPack.industry.name)).limit(1);
  if (uae.length === 0) return;

  console.log(`Backfilling industryId on ${orphans.length} legacy initiatives → ${uae[0].name}`);
  for (const row of orphans) {
    await db.update(initiatives).set({ industryId: uae[0].id }).where(eq(initiatives.id, row.id));
  }
}

// Pin legacy UAE-only certs (ASCM, CIPS, FIATA, IATA Cargo) to the UAE industry so they stop
// appearing as "cross-industry" in the India verticals. Cross-industry certs (PMP, Six Sigma)
// stay with industryId = null because they're seeded that way in shared-certifications.ts.
async function backfillLegacyUaeCertifications(): Promise<void> {
  const uae = await db.select().from(industries).where(eq(industries.name, uaeSupplyChainPack.industry.name)).limit(1);
  if (uae.length === 0) return;
  const sharedNames = new Set(SHARED_CERTIFICATIONS.map((c) => c.name));
  const uaePackNames = uaeSupplyChainPack.certifications.map((c) => c.name).filter((n) => !sharedNames.has(n));
  if (uaePackNames.length === 0) return;

  const orphans = await db
    .select()
    .from(certifications)
    .where(and(isNull(certifications.industryId), inArray(certifications.name, uaePackNames)));
  if (orphans.length === 0) return;

  console.log(`Backfilling industryId on ${orphans.length} legacy UAE certifications → ${uae[0].name}`);
  for (const row of orphans) {
    await db.update(certifications).set({ industryId: uae[0].id }).where(eq(certifications.id, row.id));
  }
}

async function seedSharedCertifications(): Promise<void> {
  for (const cert of SHARED_CERTIFICATIONS) {
    const existing = await db.select().from(certifications).where(and(eq(certifications.name, cert.name), isNull(certifications.industryId))).limit(1);
    if (existing.length > 0) continue;
    await db.insert(certifications).values({
      industryId: null,
      name: cert.name,
      provider: cert.provider,
      description: cert.description,
      benefits: cert.benefits,
      url: cert.url,
      cost: cert.cost,
      durationMonths: cert.durationMonths,
    });
  }
}

export async function seedDatabase(): Promise<void> {
  try {
    const existing = await storage.getAllIndustries();
    const existingByName = new Map(existing.map((i) => [i.name, i] as const));

    // Backfill industryId on any legacy rows that pre-date the schema change.
    await backfillLegacyInitiatives();
    await backfillLegacyUaeCertifications();

    // Seed any packs that aren't present yet (idempotent per industry, not per database).
    const missing = PACKS.filter((p) => !existingByName.has(p.industry.name));
    if (missing.length === 0 && existing.length > 0) {
      console.log("All industry packs already seeded, skipping...");
    } else {
      for (const pack of missing) {
        await seedIndustryPack(pack);
      }
    }

    await seedSharedCertifications();

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
