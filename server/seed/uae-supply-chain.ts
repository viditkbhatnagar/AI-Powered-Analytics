import type { IndustryPack, RoleLevel } from "./types";

const DOMAIN_LIST = [
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

const SUBDOMAINS: Record<string, string[]> = {
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

const SAMPLE_ROLES: Record<string, [string, string, string, string]> = {
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

// AED monthly bands per role level, lightly seeded per-domain (matches the prior baseline ± 15% variation).
// Keeping deterministic so re-seeds don't drift.
function buildSalaryBands(): Record<string, Record<RoleLevel, { min: number; max: number }>> {
  const out: Record<string, Record<RoleLevel, { min: number; max: number }>> = {};
  for (const d of DOMAIN_LIST) {
    out[d.name] = {
      ENTRY: { min: 5000, max: 12000 },
      MID: { min: 12000, max: 25000 },
      SENIOR: { min: 25000, max: 50000 },
      EXECUTIVE: { min: 45000, max: 100000 },
    };
  }
  return out;
}

const INITIATIVES = [
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

const CERTIFICATIONS = [
  { name: "ASCM CSCP", provider: "ASCM", description: "Certified Supply Chain Professional - end-to-end supply chain mastery", benefits: "Global recognition, 10-20% salary increase", url: "https://www.ascm.org", cost: 15000, durationMonths: 6 },
  { name: "ASCM CPIM", provider: "ASCM", description: "Certified in Planning and Inventory Management", benefits: "Deep operations knowledge, career advancement", url: "https://www.ascm.org", cost: 12000, durationMonths: 8 },
  { name: "CIPS Level 4", provider: "CIPS", description: "Diploma in Procurement and Supply", benefits: "Foundation for procurement excellence", url: "https://www.cips.org", cost: 8000, durationMonths: 12 },
  { name: "CIPS Level 5", provider: "CIPS", description: "Advanced Diploma in Procurement and Supply", benefits: "Strategic procurement skills", url: "https://www.cips.org", cost: 10000, durationMonths: 12 },
  { name: "CIPS Level 6", provider: "CIPS", description: "Professional Diploma in Procurement and Supply", benefits: "Executive-level procurement expertise", url: "https://www.cips.org", cost: 12000, durationMonths: 12 },
  { name: "IATA Cargo", provider: "IATA", description: "Dangerous Goods Regulations - Category 6", benefits: "Air cargo compliance, required for DG handling", url: "https://www.iata.org", cost: 3000, durationMonths: 1 },
  { name: "FIATA Diploma", provider: "FIATA", description: "International Freight Forwarding Diploma", benefits: "Industry standard for forwarders", url: "https://fiata.com", cost: 5000, durationMonths: 6 },
];

const COMPANIES = [
  { name: "DP World", description: "Global port operator and logistics provider headquartered in Dubai", website: "https://www.dpworld.com", domains: ["Ports & Terminals", "Free Zones & Special Economic", "3PL & 4PL Services"] },
  { name: "Aramex", description: "Leading logistics and transportation company in MENA", website: "https://www.aramex.com", domains: ["CEP & Last-Mile Delivery", "E-commerce Logistics", "Freight Forwarding"] },
  { name: "AD Ports Group", description: "Abu Dhabi's integrated ports and logistics company", website: "https://www.adports.ae", domains: ["Ports & Terminals", "Free Zones & Special Economic", "Sea Freight & Shipping"] },
  { name: "JAFZA", description: "Jebel Ali Free Zone - largest free zone in the region", website: "https://www.jafza.ae", domains: ["Free Zones & Special Economic", "Warehousing & Distribution", "Industrial & Manufacturing"] },
  { name: "Agility", description: "Global logistics provider with strong GCC presence", website: "https://www.agility.com", domains: ["3PL & 4PL Services", "Freight Forwarding", "Warehousing & Distribution"] },
  { name: "Emirates SkyCargo", description: "Air cargo division of Emirates airline", website: "https://www.skycargo.com", domains: ["Air Freight & Aviation Cargo", "Cold Chain & Perishables"] },
  { name: "Tristar Group", description: "Fuel and chemical logistics specialist", website: "https://www.tristar-group.co", domains: ["Road Freight & Transport", "Project & Heavy Lift"] },
  { name: "GAC Group", description: "Shipping, logistics and marine services provider", website: "https://www.gac.com", domains: ["Sea Freight & Shipping", "Freight Forwarding", "Customs & Trade Compliance"] },
  { name: "RSA Logistics", description: "Leading 3PL provider in the UAE", website: "https://www.rsa-logistics.com", domains: ["3PL & 4PL Services", "Warehousing & Distribution", "Cold Chain & Perishables"] },
  { name: "Hellmann Worldwide", description: "German logistics company with UAE operations", website: "https://www.hellmann.com", domains: ["Freight Forwarding", "Air Freight & Aviation Cargo", "Sea Freight & Shipping"] },
  { name: "DHL Express", description: "International express delivery and logistics", website: "https://www.dhl.ae", domains: ["CEP & Last-Mile Delivery", "Air Freight & Aviation Cargo", "E-commerce Logistics"] },
  { name: "Maersk", description: "Integrated logistics and container shipping", website: "https://www.maersk.com", domains: ["Sea Freight & Shipping", "Freight Forwarding", "3PL & 4PL Services"] },
  { name: "Noon", description: "Leading e-commerce platform in MENA", website: "https://www.noon.com", domains: ["E-commerce Logistics", "Warehousing & Distribution", "CEP & Last-Mile Delivery"] },
  { name: "Fetchr", description: "Technology-driven delivery company", website: "https://www.fetchr.us", domains: ["CEP & Last-Mile Delivery", "E-commerce Logistics"] },
  { name: "Carrefour UAE", description: "Major retailer with extensive logistics network", website: "https://www.carrefouruae.com", domains: ["Cold Chain & Perishables", "Warehousing & Distribution"] },
];

export const uaeSupplyChainPack: IndustryPack = {
  industry: {
    name: "Supply Chain & Logistics",
    description: "Comprehensive career data for the UAE supply chain and logistics industry, covering all major domains from road freight to technology.",
    icon: "truck",
  },
  domains: DOMAIN_LIST,
  subdomains: SUBDOMAINS,
  sampleRoles: SAMPLE_ROLES,
  salaryBands: buildSalaryBands(),
  salaryCurrency: "AED",
  salarySource: "Robert Walters UAE, NADIA UAE",
  initiatives: INITIATIVES,
  certifications: CERTIFICATIONS,
  companies: COMPANIES,
};
