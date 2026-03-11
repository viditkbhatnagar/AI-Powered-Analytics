import { storage } from "./storage";

const UAE_INITIATIVES = [
  { scope: "Dubai", name: "Dubai Economic Agenda D33", domainsImpacted: ["Trade", "Logistics", "Technology"], timeframeStart: 2023, timeframeEnd: 2033, kpiTarget: "Double GDP to AED 32 trillion", category: "Economic", sourceUrl: "https://www.d33.ae" },
  { scope: "Dubai", name: "Dubai Silk Road Strategy", domainsImpacted: ["Trade", "Sea Freight", "Air Freight"], timeframeStart: 2022, timeframeEnd: 2030, kpiTarget: "Become top 4 global logistics hub", category: "Trade", sourceUrl: "https://www.dubaichamber.com" },
  { scope: "Abu Dhabi", name: "ADIO Industrial Strategy", domainsImpacted: ["Industrial", "Manufacturing", "Technology"], timeframeStart: 2021, timeframeEnd: 2030, kpiTarget: "AED 172B industrial output", category: "Industrial", sourceUrl: "https://www.adio.ae" },
  { scope: "Abu Dhabi", name: "AD Ports Expansion", domainsImpacted: ["Ports", "Sea Freight", "Free Zones"], timeframeStart: 2020, timeframeEnd: 2030, kpiTarget: "35M TEU capacity", category: "Infrastructure", sourceUrl: "https://www.adports.ae" },
  { scope: "UAE Federal", name: "UAE Net Zero 2050", domainsImpacted: ["All Domains"], timeframeStart: 2021, timeframeEnd: 2050, kpiTarget: "Net zero carbon emissions", category: "Sustainability", sourceUrl: "https://www.uaenetzero.ae" },
  { scope: "UAE Federal", name: "CEPA Trade Agreements", domainsImpacted: ["Trade", "Customs", "Freight Forwarding"], timeframeStart: 2022, timeframeEnd: 2030, kpiTarget: "50+ trade agreements", category: "Trade", sourceUrl: "https://www.economy.gov.ae" },
  { scope: "Dubai", name: "Smart Dubai 2021-2025", domainsImpacted: ["Technology", "E-commerce", "Last-Mile"], timeframeStart: 2021, timeframeEnd: 2025, kpiTarget: "100% digital government services", category: "Digital", sourceUrl: "https://www.smartdubai.ae" },
  { scope: "Sharjah", name: "Sharjah Logistics Hub", domainsImpacted: ["Warehousing", "Road Freight", "3PL/4PL"], timeframeStart: 2022, timeframeEnd: 2028, kpiTarget: "Regional logistics center", category: "Infrastructure", sourceUrl: "https://www.sharjahinvest.com" },
  { scope: "Fujairah", name: "Fujairah Port Development", domainsImpacted: ["Ports", "Sea Freight", "Cold Chain"], timeframeStart: 2020, timeframeEnd: 2027, kpiTarget: "Major bunkering hub", category: "Infrastructure", sourceUrl: "https://www.fujport.ae" },
  { scope: "UAE Federal", name: "Operation 300bn", domainsImpacted: ["Industrial", "Manufacturing", "Technology"], timeframeStart: 2021, timeframeEnd: 2031, kpiTarget: "AED 300B industrial sector", category: "Industrial", sourceUrl: "https://www.moiat.gov.ae" },
  { scope: "Dubai", name: "Dubai CommerCity", domainsImpacted: ["E-commerce", "Last-Mile", "Warehousing"], timeframeStart: 2019, timeframeEnd: 2025, kpiTarget: "MENA e-commerce hub", category: "Digital", sourceUrl: "https://www.dubaicommercity.ae" },
  { scope: "Abu Dhabi", name: "Khalifa Port City", domainsImpacted: ["Ports", "Free Zones", "Industrial"], timeframeStart: 2020, timeframeEnd: 2030, kpiTarget: "Integrated industrial zone", category: "Infrastructure", sourceUrl: "https://www.adports.ae" },
];

const DOMAINS = [
  { name: "Road Freight & Transport", icon: "truck", description: "Domestic and cross-border trucking, fleet management, and ground transportation services across the UAE and GCC." },
  { name: "Sea Freight & Shipping", icon: "ship", description: "Maritime cargo operations, container shipping, vessel chartering, and ocean freight forwarding." },
  { name: "Air Freight & Aviation Cargo", icon: "plane", description: "Air cargo handling, express freight, aircraft loading operations, and aviation logistics." },
  { name: "Rail & Intermodal", icon: "train", description: "Railway freight operations, multimodal transport integration, and Etihad Rail network services." },
  { name: "Ports & Terminals", icon: "anchor", description: "Port operations, terminal management, stevedoring, and maritime infrastructure." },
  { name: "Freight Forwarding", icon: "package", description: "International freight coordination, cargo consolidation, and multi-modal shipment management." },
  { name: "Customs & Trade Compliance", icon: "file-check", description: "Customs clearance, trade documentation, regulatory compliance, and tariff classification." },
  { name: "Warehousing & Distribution", icon: "warehouse", description: "Storage facilities, inventory management, order fulfillment, and distribution center operations." },
  { name: "3PL & 4PL Services", icon: "building", description: "Third and fourth-party logistics, integrated supply chain solutions, and logistics outsourcing." },
  { name: "Value-Added Services", icon: "box", description: "Packaging, labeling, kitting, assembly, and product customization services." },
  { name: "CEP & Last-Mile Delivery", icon: "mail", description: "Courier, express, parcel services, and final-mile delivery to consumers and businesses." },
  { name: "E-commerce Logistics", icon: "cart", description: "Online retail fulfillment, marketplace logistics, and digital commerce supply chains." },
  { name: "Cold Chain & Perishables", icon: "snowflake", description: "Temperature-controlled logistics, pharmaceutical distribution, and fresh food supply chains." },
  { name: "Project & Heavy Lift", icon: "wrench", description: "Oversized cargo handling, project logistics, and heavy equipment transportation." },
  { name: "Industrial & Manufacturing", icon: "factory", description: "Manufacturing logistics, production supply chains, and industrial materials handling." },
  { name: "Free Zones & Special Economic", icon: "map-pin", description: "Free zone operations, special economic zone logistics, and bonded warehouse services." },
  { name: "Supply Chain Planning", icon: "clipboard", description: "Demand forecasting, inventory optimization, S&OP, and network design." },
  { name: "Supply Chain Technology", icon: "cpu", description: "WMS, TMS, IoT, blockchain, and digital transformation in logistics." },
];

const SUBDOMAINS = {
  "Road Freight & Transport": ["Fleet Operations", "Cross-border Transport", "Tanker Transport", "Container Haulage"],
  "Sea Freight & Shipping": ["FCL Operations", "LCL Consolidation", "Vessel Chartering", "Maritime Documentation"],
  "Air Freight & Aviation Cargo": ["Express Cargo", "Charter Services", "Ground Handling", "Dangerous Goods"],
  "Rail & Intermodal": ["Rail Freight", "Multimodal Coordination", "Terminal Operations"],
  "Ports & Terminals": ["Container Terminals", "Bulk Handling", "Ro-Ro Operations", "Cruise Terminals"],
  "Freight Forwarding": ["Export Forwarding", "Import Forwarding", "Project Forwarding", "Breakbulk"],
  "Customs & Trade Compliance": ["Customs Brokerage", "Trade Compliance", "AEO Certification", "Origin Management"],
  "Warehousing & Distribution": ["Contract Warehousing", "Public Warehousing", "Cross-Docking", "Pick & Pack"],
  "3PL & 4PL Services": ["Contract Logistics", "Lead Logistics", "Integrated Solutions"],
  "Value-Added Services": ["Packaging", "Kitting & Assembly", "Quality Control", "Returns Processing"],
  "CEP & Last-Mile Delivery": ["Express Delivery", "Same-Day Delivery", "Parcel Lockers", "White Glove"],
  "E-commerce Logistics": ["Fulfillment Centers", "Returns Management", "Marketplace Integration"],
  "Cold Chain & Perishables": ["Pharma Logistics", "Food Distribution", "Temperature Monitoring"],
  "Project & Heavy Lift": ["Heavy Transport", "Rigging & Lifting", "Project Management"],
  "Industrial & Manufacturing": ["JIT Delivery", "Vendor Managed Inventory", "Production Logistics"],
  "Free Zones & Special Economic": ["JAFZA Operations", "KIZAD Logistics", "SAIF Zone"],
  "Supply Chain Planning": ["Demand Planning", "Network Optimization", "S&OP"],
  "Supply Chain Technology": ["WMS Implementation", "TMS Solutions", "IoT & Tracking"],
};

const ROLE_LEVELS = ["ENTRY", "MID", "SENIOR", "EXECUTIVE"] as const;

const SAMPLE_ROLES = {
  "Fleet Operations": ["Fleet Coordinator", "Transport Planner", "Fleet Manager", "VP Transport"],
  "FCL Operations": ["Documentation Clerk", "Operations Executive", "Ocean Freight Manager", "Director Sea Freight"],
  "Express Cargo": ["Cargo Handler", "Air Freight Coordinator", "Air Cargo Manager", "Head of Air Freight"],
  "Container Terminals": ["Equipment Operator", "Terminal Supervisor", "Terminal Manager", "Director Port Operations"],
  "Export Forwarding": ["Forwarding Assistant", "Export Coordinator", "Freight Manager", "GM Forwarding"],
  "Customs Brokerage": ["Customs Clerk", "Licensed Broker", "Customs Manager", "Head of Customs"],
  "Contract Warehousing": ["Warehouse Associate", "Inventory Controller", "Warehouse Manager", "VP Operations"],
  "Contract Logistics": ["Operations Assistant", "Account Executive", "3PL Manager", "Director 3PL"],
  "Express Delivery": ["Delivery Rider", "Route Supervisor", "Delivery Manager", "Head of Last-Mile"],
  "Fulfillment Centers": ["Picker/Packer", "Fulfillment Lead", "E-commerce Manager", "VP E-commerce"],
  "Pharma Logistics": ["Cold Chain Handler", "QA Coordinator", "Cold Chain Manager", "Director Pharma"],
  "Demand Planning": ["Planning Analyst", "Demand Planner", "Planning Manager", "VP Supply Chain"],
  "WMS Implementation": ["IT Support", "Systems Analyst", "Technology Manager", "CTO Logistics"],
};

const CERTIFICATIONS = [
  { name: "ASCM CSCP", provider: "ASCM", description: "Certified Supply Chain Professional - end-to-end supply chain mastery", benefits: "Global recognition, 10-20% salary increase", url: "https://www.ascm.org", cost: 15000, durationMonths: 6 },
  { name: "ASCM CPIM", provider: "ASCM", description: "Certified in Planning and Inventory Management", benefits: "Deep operations knowledge, career advancement", url: "https://www.ascm.org", cost: 12000, durationMonths: 8 },
  { name: "CIPS Level 4", provider: "CIPS", description: "Diploma in Procurement and Supply", benefits: "Foundation for procurement excellence", url: "https://www.cips.org", cost: 8000, durationMonths: 12 },
  { name: "CIPS Level 5", provider: "CIPS", description: "Advanced Diploma in Procurement and Supply", benefits: "Strategic procurement skills", url: "https://www.cips.org", cost: 10000, durationMonths: 12 },
  { name: "CIPS Level 6", provider: "CIPS", description: "Professional Diploma in Procurement and Supply", benefits: "Executive-level procurement expertise", url: "https://www.cips.org", cost: 12000, durationMonths: 12 },
  { name: "IATA Cargo", provider: "IATA", description: "Dangerous Goods Regulations - Category 6", benefits: "Air cargo compliance, required for DG handling", url: "https://www.iata.org", cost: 3000, durationMonths: 1 },
  { name: "FIATA Diploma", provider: "FIATA", description: "International Freight Forwarding Diploma", benefits: "Industry standard for forwarders", url: "https://fiata.com", cost: 5000, durationMonths: 6 },
  { name: "PMP", provider: "PMI", description: "Project Management Professional", benefits: "Project leadership, cross-industry recognition", url: "https://www.pmi.org", cost: 10000, durationMonths: 4 },
  { name: "Six Sigma Green Belt", provider: "ASQ", description: "Lean Six Sigma methodology certification", benefits: "Process improvement, quality management", url: "https://asq.org", cost: 8000, durationMonths: 3 },
  { name: "Six Sigma Black Belt", provider: "ASQ", description: "Advanced Lean Six Sigma practitioner", benefits: "Lead improvement projects, consultant level", url: "https://asq.org", cost: 15000, durationMonths: 6 },
];

const COMPANIES = [
  { name: "DP World", description: "Global port operator and logistics provider headquartered in Dubai", website: "https://www.dpworld.com" },
  { name: "Aramex", description: "Leading logistics and transportation company in MENA", website: "https://www.aramex.com" },
  { name: "AD Ports Group", description: "Abu Dhabi's integrated ports and logistics company", website: "https://www.adports.ae" },
  { name: "JAFZA", description: "Jebel Ali Free Zone - largest free zone in the region", website: "https://www.jafza.ae" },
  { name: "Agility", description: "Global logistics provider with strong GCC presence", website: "https://www.agility.com" },
  { name: "Emirates SkyCargo", description: "Air cargo division of Emirates airline", website: "https://www.skycargo.com" },
  { name: "Tristar Group", description: "Fuel and chemical logistics specialist", website: "https://www.tristar-group.co" },
  { name: "GAC Group", description: "Shipping, logistics and marine services provider", website: "https://www.gac.com" },
  { name: "RSA Logistics", description: "Leading 3PL provider in the UAE", website: "https://www.rsa-logistics.com" },
  { name: "Hellmann Worldwide", description: "German logistics company with UAE operations", website: "https://www.hellmann.com" },
  { name: "DHL Express", description: "International express delivery and logistics", website: "https://www.dhl.ae" },
  { name: "Maersk", description: "Integrated logistics and container shipping", website: "https://www.maersk.com" },
  { name: "Noon", description: "Leading e-commerce platform in MENA", website: "https://www.noon.com" },
  { name: "Fetchr", description: "Technology-driven delivery company", website: "https://www.fetchr.us" },
  { name: "Carrefour UAE", description: "Major retailer with extensive logistics network", website: "https://www.carrefouruae.com" },
];

const COMPANY_DOMAIN_LINKS = [
  { company: "DP World", domains: ["Ports & Terminals", "Free Zones & Special Economic", "3PL & 4PL Services"] },
  { company: "Aramex", domains: ["CEP & Last-Mile Delivery", "E-commerce Logistics", "Freight Forwarding"] },
  { company: "AD Ports Group", domains: ["Ports & Terminals", "Free Zones & Special Economic", "Sea Freight & Shipping"] },
  { company: "JAFZA", domains: ["Free Zones & Special Economic", "Warehousing & Distribution", "Industrial & Manufacturing"] },
  { company: "Agility", domains: ["3PL & 4PL Services", "Freight Forwarding", "Warehousing & Distribution"] },
  { company: "Emirates SkyCargo", domains: ["Air Freight & Aviation Cargo", "Cold Chain & Perishables"] },
  { company: "Tristar Group", domains: ["Road Freight & Transport", "Project & Heavy Lift"] },
  { company: "GAC Group", domains: ["Sea Freight & Shipping", "Freight Forwarding", "Customs & Trade Compliance"] },
  { company: "RSA Logistics", domains: ["3PL & 4PL Services", "Warehousing & Distribution", "Cold Chain & Perishables"] },
  { company: "Hellmann Worldwide", domains: ["Freight Forwarding", "Air Freight & Aviation Cargo", "Sea Freight & Shipping"] },
  { company: "DHL Express", domains: ["CEP & Last-Mile Delivery", "Air Freight & Aviation Cargo", "E-commerce Logistics"] },
  { company: "Maersk", domains: ["Sea Freight & Shipping", "Freight Forwarding", "3PL & 4PL Services"] },
  { company: "Noon", domains: ["E-commerce Logistics", "Warehousing & Distribution", "CEP & Last-Mile Delivery"] },
  { company: "Fetchr", domains: ["CEP & Last-Mile Delivery", "E-commerce Logistics"] },
  { company: "Carrefour UAE", domains: ["Cold Chain & Perishables", "Warehousing & Distribution"] },
];

export async function seedDatabase() {
  try {
    // Check if already seeded
    const existingIndustries = await storage.getAllIndustries();
    if (existingIndustries.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }

    console.log("Seeding database with UAE Supply Chain data...");

    // Create industry
    const industry = await storage.createIndustry({
      name: "Supply Chain & Logistics",
      description: "Comprehensive career data for the UAE supply chain and logistics industry, covering all major domains from road freight to technology.",
      icon: "truck",
      isPreloaded: true,
    });

    // Create domains and map IDs
    const domainMap = new Map<string, number>();
    for (const domainData of DOMAINS) {
      const domain = await storage.createDomain({
        industryId: industry.id,
        name: domainData.name,
        description: domainData.description,
        icon: domainData.icon,
      });
      domainMap.set(domainData.name, domain.id);
    }

    // Create subdomains and roles
    const subdomainMap = new Map<string, number>();
    for (const [domainName, subs] of Object.entries(SUBDOMAINS)) {
      const domainId = domainMap.get(domainName);
      if (!domainId) continue;

      for (const subName of subs) {
        const subdomain = await storage.createSubdomain({
          domainId,
          name: subName,
          description: `${subName} operations and career paths within ${domainName}.`,
        });
        subdomainMap.set(subName, subdomain.id);

        // Create roles for this subdomain
        const roles = SAMPLE_ROLES[subName as keyof typeof SAMPLE_ROLES];
        if (roles) {
          for (let i = 0; i < roles.length && i < ROLE_LEVELS.length; i++) {
            await storage.createRole({
              subdomainId: subdomain.id,
              name: roles[i],
              level: ROLE_LEVELS[i],
            });
          }
        }
      }
    }

    // Create salaries for each domain
    for (const [domainName, domainId] of domainMap) {
      for (const level of ROLE_LEVELS) {
        const baseMin = level === "ENTRY" ? 5000 : level === "MID" ? 12000 : level === "SENIOR" ? 25000 : 45000;
        const baseMax = level === "ENTRY" ? 12000 : level === "MID" ? 25000 : level === "SENIOR" ? 50000 : 100000;
        const variation = Math.random() * 0.3 - 0.15; // +/- 15% variation

        await storage.createSalary({
          domainId,
          roleLevel: level,
          minSalary: Math.round(baseMin * (1 + variation)),
          maxSalary: Math.round(baseMax * (1 + variation)),
          currency: "AED",
          source: "Robert Walters UAE, NADIA UAE",
        });
      }
    }

    // Create initiatives
    for (const init of UAE_INITIATIVES) {
      await storage.createInitiative({
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

    // Create certifications
    for (const cert of CERTIFICATIONS) {
      await storage.createCertification({
        name: cert.name,
        provider: cert.provider,
        description: cert.description,
        benefits: cert.benefits,
        url: cert.url,
        cost: cert.cost,
        durationMonths: cert.durationMonths,
      });
    }

    // Create companies and link to domains
    const companyMap = new Map<string, number>();
    for (const comp of COMPANIES) {
      const company = await storage.createCompany({
        name: comp.name,
        description: comp.description,
        website: comp.website,
      });
      companyMap.set(comp.name, company.id);
    }

    // Link companies to domains
    for (const link of COMPANY_DOMAIN_LINKS) {
      const companyId = companyMap.get(link.company);
      if (!companyId) continue;

      for (const domainName of link.domains) {
        const domainId = domainMap.get(domainName);
        if (domainId) {
          await storage.linkCompanyToDomain(companyId, domainId);
        }
      }
    }

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
