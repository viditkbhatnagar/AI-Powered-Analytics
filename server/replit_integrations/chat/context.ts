import { storage } from "../../storage";

interface CachedContext {
  text: string;
  builtAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<number, CachedContext>();

function lakhs(annualRupees: number): string {
  const v = annualRupees / 100_000;
  return v >= 10 ? `${Math.round(v)} LPA` : `${Math.round(v * 10) / 10} LPA`;
}

function formatSalary(min: number, max: number, currency: string): string {
  if (currency === "INR") return `₹${lakhs(min)}–${lakhs(max)}`;
  return `${currency} ${min.toLocaleString()}–${max.toLocaleString()}/mo`;
}

// Build a compact, model-friendly summary of everything we know about one industry.
// Designed to fit in a couple of thousand tokens so it can sit in every chat call's
// system prompt without bloating cost.
export async function buildIndustryContext(industryId: number): Promise<string> {
  const cached = cache.get(industryId);
  if (cached && Date.now() - cached.builtAt < CACHE_TTL_MS) return cached.text;

  const industry = await storage.getIndustryById(industryId);
  if (!industry) return "";

  const [domains, salaries, initiatives, certifications, companies] = await Promise.all([
    storage.getAllDomains(industryId),
    storage.getAllSalaries(undefined, industryId),
    storage.getAllInitiatives(industryId),
    storage.getAllCertifications(undefined, industryId),
    storage.getAllCompanies(undefined, industryId),
  ]);

  const lines: string[] = [];
  lines.push(`Active industry: ${industry.name}`);
  lines.push(industry.description);
  lines.push("");

  lines.push(`Domains (${domains.length}):`);
  for (const d of domains) {
    const roleCount = d.roleCount ?? 0;
    const subCount = d.subdomainCount ?? 0;
    lines.push(`- ${d.name} — ${subCount} sub-domains, ${roleCount} roles. ${d.description}`);
  }
  lines.push("");

  // Group salaries by domain for compact presentation.
  if (salaries.length > 0) {
    const currency = salaries[0]?.currency ?? "AED";
    const byDomain = new Map<number, typeof salaries>();
    for (const s of salaries) {
      const arr = byDomain.get(s.domainId) ?? [];
      arr.push(s);
      byDomain.set(s.domainId, arr);
    }
    lines.push(`Salary bands (${currency}; AED rows are monthly, INR rows are annual shown as LPA):`);
    for (const d of domains) {
      const rows = byDomain.get(d.id) ?? [];
      if (rows.length === 0) continue;
      const byLevel = new Map(rows.map((r) => [r.roleLevel, r] as const));
      const parts: string[] = [];
      for (const level of ["ENTRY", "MID", "SENIOR", "EXECUTIVE"] as const) {
        const r = byLevel.get(level);
        if (!r) continue;
        parts.push(`${level}: ${formatSalary(r.minSalary, r.maxSalary, r.currency)}`);
      }
      lines.push(`- ${d.name}: ${parts.join(" | ")}`);
    }
    lines.push("");
  }

  if (initiatives.length > 0) {
    lines.push(`Initiatives (${initiatives.length}):`);
    for (const i of initiatives) {
      lines.push(`- ${i.name} (${i.scope}, ${i.timeframeStart}–${i.timeframeEnd}, ${i.category}). Target: ${i.kpiTarget}.`);
    }
    lines.push("");
  }

  if (certifications.length > 0) {
    lines.push(`Certifications (${certifications.length}):`);
    for (const c of certifications) {
      const cost = c.cost ? ` ~${c.cost}` : "";
      const dur = c.durationMonths ? ` ~${c.durationMonths}mo` : "";
      lines.push(`- ${c.name} (${c.provider}${cost}${dur}). ${c.description}`);
    }
    lines.push("");
  }

  if (companies.length > 0) {
    lines.push(`Employers (${companies.length}):`);
    for (const c of companies) {
      lines.push(`- ${c.name}. ${c.description}`);
    }
    lines.push("");
  }

  const text = lines.join("\n");
  cache.set(industryId, { text, builtAt: Date.now() });
  return text;
}

export function invalidateIndustryContext(industryId?: number) {
  if (industryId === undefined) cache.clear();
  else cache.delete(industryId);
}
