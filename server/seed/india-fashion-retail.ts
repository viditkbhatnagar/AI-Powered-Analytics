import type { IndustryPack } from "./types";

const lpa = (x: number) => Math.round(x * 100_000);

const DOMAINS = [
  { name: "Fashion Design", icon: "scissors", description: "Trend-led design, product development and collection building for womenswear, menswear and accessories." },
  { name: "Merchandising & Buying", icon: "clipboard", description: "Range planning, vendor management, buying calendars, costing and assortment ownership for brands and retailers." },
  { name: "Retail Operations", icon: "store", description: "Store operations, customer conversion, replenishment, POS and floor leadership across physical retail." },
  { name: "Visual Merchandising", icon: "paintbrush", description: "Store displays, window storytelling, planograms, mannequin styling and brand visualisation on the floor." },
  { name: "Production & Sourcing", icon: "factory", description: "BOM ownership, TNA tracking, sampling, sourcing partners and factory coordination from concept to delivery." },
  { name: "Quality & Compliance", icon: "check-circle", description: "AQL inspections, measurement audits, defect mapping and apparel compliance for domestic and export shipments." },
  { name: "E-commerce & Omnichannel", icon: "monitor", description: "Marketplace operations, catalogue hygiene, listings, returns and omnichannel coordination across digital retail." },
];

const SUBDOMAINS: Record<string, string[]> = {
  "Fashion Design": ["Womenswear Design", "Menswear Design", "Accessories & Footwear Design"],
  "Merchandising & Buying": ["Merchandising", "Buying"],
  "Retail Operations": ["Store Operations", "Customer Experience"],
  "Visual Merchandising": ["In-Store VM", "Window & Brand VM"],
  "Production & Sourcing": ["Production Coordination", "Sourcing"],
  "Quality & Compliance": ["Quality Control", "Compliance"],
  "E-commerce & Omnichannel": ["Marketplace Operations", "Catalogue & Content"],
};

const SAMPLE_ROLES: Record<string, [string, string, string, string]> = {
  "Womenswear Design": ["Design Assistant", "Fashion Designer", "Senior Fashion Designer", "Design Manager"],
  "Menswear Design": ["Design Assistant", "Fashion Designer", "Senior Fashion Designer", "Design Manager"],
  "Accessories & Footwear Design": ["Accessories Design Assistant", "Accessories Designer", "Senior Accessories Designer", "Accessories Design Manager"],
  "Merchandising": ["Merchandiser", "Senior Merchandiser", "Merchandising Manager", "Head of Merchandising"],
  "Buying": ["Buying Assistant", "Associate Buyer", "Buyer", "Purchasing Manager"],
  "Store Operations": ["Retail Sales Associate", "Department Manager", "Retail Store Manager", "Area Retail Manager"],
  "Customer Experience": ["Customer Experience Executive", "CX Lead", "CX Manager", "Head of Customer Experience"],
  "In-Store VM": ["Visual Merchandiser", "Store VM Lead", "Area VM Manager", "Head of Visual Merchandising"],
  "Window & Brand VM": ["Window Display Stylist", "Window Design Lead", "Brand VM Manager", "Creative Director VM"],
  "Production Coordination": ["Production Coordinator", "Production Supervisor", "Production Manager", "Head of Production"],
  "Sourcing": ["Sourcing Associate", "Sourcing Executive", "Sourcing Manager", "Head of Sourcing"],
  "Quality Control": ["Quality Inspector", "QA Auditor", "Quality Manager", "Head of Quality"],
  "Compliance": ["Compliance Executive", "Compliance Lead", "Compliance Manager", "Head of Compliance"],
  "Marketplace Operations": ["E-commerce Operations Executive", "Marketplace Lead", "eCommerce Manager", "Category Manager"],
  "Catalogue & Content": ["Digital Cataloguer", "Content Lead", "Catalogue Manager", "Head of Digital Content"],
};

// Annual INR bands per role level, mapped from the India School of Fashion & Retail fact sheet
// (entry 0–2 yr, 3–7 yr progression, and inferred manager / senior-manager bands).
const SALARY_BANDS = {
  "Fashion Design": { ENTRY: { min: lpa(1.4), max: lpa(5.9) }, MID: { min: lpa(4.0), max: lpa(12.9) }, SENIOR: { min: lpa(8), max: lpa(16) }, EXECUTIVE: { min: lpa(14), max: lpa(25) } },
  "Merchandising & Buying": { ENTRY: { min: lpa(3.0), max: lpa(5.6) }, MID: { min: lpa(4.2), max: lpa(10.5) }, SENIOR: { min: lpa(8), max: lpa(15) }, EXECUTIVE: { min: lpa(15), max: lpa(25) } },
  "Retail Operations": { ENTRY: { min: lpa(1.7), max: lpa(4.9) }, MID: { min: lpa(3.6), max: lpa(9.2) }, SENIOR: { min: lpa(8), max: lpa(15) }, EXECUTIVE: { min: lpa(14), max: lpa(22) } },
  "Visual Merchandising": { ENTRY: { min: lpa(3.7), max: lpa(6.0) }, MID: { min: lpa(4.8), max: lpa(9.2) }, SENIOR: { min: lpa(8), max: lpa(14) }, EXECUTIVE: { min: lpa(13), max: lpa(20) } },
  "Production & Sourcing": { ENTRY: { min: lpa(3.3), max: lpa(4.6) }, MID: { min: lpa(4.0), max: lpa(8.0) }, SENIOR: { min: lpa(8), max: lpa(13) }, EXECUTIVE: { min: lpa(13), max: lpa(22) } },
  "Quality & Compliance": { ENTRY: { min: lpa(2.4), max: lpa(4.8) }, MID: { min: lpa(4.9), max: lpa(11.5) }, SENIOR: { min: lpa(9), max: lpa(15) }, EXECUTIVE: { min: lpa(14), max: lpa(22) } },
  "E-commerce & Omnichannel": { ENTRY: { min: lpa(3.2), max: lpa(4.5) }, MID: { min: lpa(5.5), max: lpa(13.5) }, SENIOR: { min: lpa(10), max: lpa(18) }, EXECUTIVE: { min: lpa(16), max: lpa(30) } },
} as const;

const INITIATIVES = [
  { scope: "India", name: "PLI Scheme for Textiles", domainsImpacted: ["Production & Sourcing", "Quality & Compliance"], timeframeStart: 2021, timeframeEnd: 2027, kpiTarget: "₹10,683 cr outlay for MMF, MMF fabric and technical textiles", category: "Policy", sourceUrl: "https://pib.gov.in/PressReleasePage.aspx?PRID=1753118" },
  { scope: "India", name: "PM MITRA Mega Textile Parks", domainsImpacted: ["Production & Sourcing", "Quality & Compliance"], timeframeStart: 2021, timeframeEnd: 2027, kpiTarget: "7 integrated textile parks, ₹4,445 cr outlay", category: "Infrastructure", sourceUrl: "https://pib.gov.in/PressReleasePage.aspx?PRID=2043807" },
  { scope: "India", name: "National Technical Textiles Mission", domainsImpacted: ["Production & Sourcing"], timeframeStart: 2020, timeframeEnd: 2026, kpiTarget: "₹1,480 cr outlay; technical textiles market US$23.3B by 2027", category: "Policy", sourceUrl: "https://pib.gov.in/PressReleasePage.aspx?PRID=2115710" },
  { scope: "India", name: "Samarth Skilling Scheme", domainsImpacted: ["Fashion Design", "Production & Sourcing", "Quality & Compliance"], timeframeStart: 2017, timeframeEnd: 2026, kpiTarget: "₹495 cr extension to train 3 lakh; 4.57L trained, 3.55L placed by Jul 2025", category: "Skilling", sourceUrl: "https://pib.gov.in/PressReleaseIframePage.aspx?PRID=2065497" },
  { scope: "India", name: "Mall Space Build-out, Top 7 Cities", domainsImpacted: ["Retail Operations", "Visual Merchandising"], timeframeStart: 2024, timeframeEnd: 2026, kpiTarget: "+16.6 million sq ft new shopping mall space", category: "Infrastructure", sourceUrl: "https://www.ibef.org/industry/retail-india" },
  { scope: "India", name: "D2C Shipment Surge to 2.5B", domainsImpacted: ["E-commerce & Omnichannel", "Retail Operations"], timeframeStart: 2024, timeframeEnd: 2030, kpiTarget: "2.5 billion D2C shipments per year by 2030", category: "Digital", sourceUrl: "https://www.ibef.org/industry/retail-india" },
  { scope: "India", name: "E-commerce US$53B → US$91B", domainsImpacted: ["E-commerce & Omnichannel"], timeframeStart: 2024, timeframeEnd: 2029, kpiTarget: "India e-commerce GMV from US$53.08B (2024) to US$91.24B (2029)", category: "Digital", sourceUrl: "https://www.ibef.org/industry/retail-india" },
  { scope: "India", name: "100% FDI in Single-Brand Retail & E-commerce", domainsImpacted: ["Retail Operations", "E-commerce & Omnichannel"], timeframeStart: 2018, timeframeEnd: 2030, kpiTarget: "Automatic route, no government approval needed", category: "Policy", sourceUrl: "https://www.investindia.gov.in/sector/retail-e-commerce" },
  { scope: "India", name: "Textile & Apparel Exports to US$100B", domainsImpacted: ["Production & Sourcing", "Quality & Compliance", "Merchandising & Buying"], timeframeStart: 2024, timeframeEnd: 2030, kpiTarget: "FY24 US$35.87B → target US$100B by 2030", category: "Trade", sourceUrl: "https://texmin.nic.in" },
  { scope: "India", name: "Retail Sector to US$1.93 Trillion", domainsImpacted: ["Retail Operations", "Merchandising & Buying", "Visual Merchandising"], timeframeStart: 2024, timeframeEnd: 2030, kpiTarget: "US$1.06T (2024) → US$1.93T (2030); 25M new jobs", category: "Economic", sourceUrl: "https://www.deloitte.com/in/en/about/press-room/india-s-us-1-06-trillion-retail-sector-is-set-to-reach-1-93-trillion-by-2030.html" },
];

const CERTIFICATIONS = [
  { name: "NSDC AMH/Q1201 Fashion Designer", provider: "Apparel, Made-ups & Home Furnishing SSC", description: "NSQF Level 5 qualification covering trend research, tech packs and product development.", benefits: "Industry-recognised entry into design assistant and designer roles.", url: "https://nsdcindia.org", cost: 20000, durationMonths: 12 },
  { name: "NSDC AMH/Q0901 Merchandiser", provider: "Apparel, Made-ups & Home Furnishing SSC", description: "NSQF Level 5 qualification for merchandising, costing and vendor calendars.", benefits: "Foundation for buying houses, export houses and brand merchandising teams.", url: "https://nsdcindia.org", cost: 18000, durationMonths: 9 },
  { name: "NSDC RAS/Q0104 Retail Sales Associate", provider: "Retailers Association's Skill Council of India (RASCI)", description: "NSQF Level 4 qualification for store floor operations, POS and customer conversion.", benefits: "Direct entry into organised retail sales roles.", url: "https://rasci.in", cost: 8000, durationMonths: 4 },
  { name: "NSDC RAS/Q0402 Visual Merchandiser", provider: "RASCI", description: "NSQF qualification for store displays, planograms, mannequin styling and window concepts.", benefits: "Standard pathway into VM teams at brands and department stores.", url: "https://rasci.in", cost: 12000, durationMonths: 6 },
  { name: "NSDC Seller Activation Executive", provider: "Sector Skill Council for Logistics / RASCI", description: "Skills for onboarding sellers, listings management and marketplace operations.", benefits: "Aligned to e-commerce operations and marketplace executive roles.", url: "https://nsdcindia.org", cost: 10000, durationMonths: 3 },
  { name: "NSDC Digital Cataloguer", provider: "RASCI", description: "Catalogue hygiene, product content, image/copy QA and listing updates.", benefits: "Direct entry into catalogue and content teams.", url: "https://rasci.in", cost: 8000, durationMonths: 3 },
  { name: "Apparel Quality Auditor (AQL)", provider: "Apparel Training & Design Centre (ATDC)", description: "AQL inspection methodology, defect classification and shipment release.", benefits: "Required for quality auditor and pre-shipment inspection roles.", url: "https://www.atdcindia.co.in", cost: 15000, durationMonths: 4 },
  { name: "Diploma in Export Management", provider: "Indian Institute of Foreign Trade (IIFT)", description: "Export documentation, incoterms, costing and compliance for buying houses.", benefits: "Strong adjacency for buying assistant and sourcing roles in export houses.", url: "https://www.iift.ac.in", cost: 50000, durationMonths: 12 },
];

const COMPANIES = [
  { name: "Reliance Retail", description: "India's largest retailer spanning fashion, grocery, electronics and digital commerce.", website: "https://relianceretail.com", domains: ["Retail Operations", "Merchandising & Buying", "Visual Merchandising", "E-commerce & Omnichannel"] },
  { name: "Trent (Tata Group)", description: "Operator of Westside, Zudio and Star Bazaar; one of India's fastest-growing apparel retailers.", website: "https://www.trent-tata.com", domains: ["Retail Operations", "Merchandising & Buying", "Visual Merchandising", "Fashion Design"] },
  { name: "Aditya Birla Fashion & Retail (ABFRL)", description: "House of Pantaloons, Allen Solly, Van Heusen, Louis Philippe, Peter England and others.", website: "https://www.abfrl.com", domains: ["Retail Operations", "Merchandising & Buying", "Fashion Design", "Visual Merchandising"] },
  { name: "Shoppers Stop", description: "Premium department store chain across Indian metros and Tier-1 cities.", website: "https://corporate.shoppersstop.com", domains: ["Retail Operations", "Visual Merchandising", "Merchandising & Buying"] },
  { name: "Lifestyle International (Landmark Group)", description: "Department store chain with Lifestyle, Max and Home Centre brands.", website: "https://www.lifestylestores.com", domains: ["Retail Operations", "Visual Merchandising", "Merchandising & Buying"] },
  { name: "Myntra (Flipkart Group)", description: "Leading fashion-focused e-commerce platform in India.", website: "https://www.myntra.com", domains: ["E-commerce & Omnichannel", "Merchandising & Buying", "Fashion Design"] },
  { name: "Nykaa", description: "Beauty and fashion e-commerce platform with strong omnichannel presence.", website: "https://www.nykaa.com", domains: ["E-commerce & Omnichannel", "Retail Operations", "Visual Merchandising"] },
  { name: "H&M India", description: "Global fast-fashion retailer with 60+ stores across India.", website: "https://www2.hm.com/en_in", domains: ["Retail Operations", "Visual Merchandising", "Merchandising & Buying"] },
  { name: "Zara India (Inditex)", description: "Inditex Group's flagship fashion retailer in Indian metros.", website: "https://www.zara.com/in/", domains: ["Retail Operations", "Visual Merchandising", "Merchandising & Buying"] },
  { name: "Shahi Exports", description: "India's largest apparel exporter and a major employer in pre-production and quality.", website: "https://www.shahi.co.in", domains: ["Production & Sourcing", "Quality & Compliance", "Merchandising & Buying"] },
  { name: "Raymond", description: "Integrated textile and apparel major with manufacturing and retail businesses.", website: "https://www.raymond.in", domains: ["Production & Sourcing", "Retail Operations", "Fashion Design"] },
  { name: "Arvind Limited", description: "Vertically integrated textile and apparel manufacturer with major export operations.", website: "https://www.arvind.com", domains: ["Production & Sourcing", "Quality & Compliance", "Merchandising & Buying"] },
];

export const indiaFashionRetailPack: IndustryPack = {
  industry: {
    name: "Fashion & Retail (India)",
    description: "India's fashion and retail careers — design, merchandising, buying, store operations, VM, production and e-commerce across a US$1.06T retail market projected to reach US$1.93T by 2030.",
    icon: "shopping-bag",
  },
  domains: DOMAINS,
  subdomains: SUBDOMAINS,
  sampleRoles: SAMPLE_ROLES,
  salaryBands: SALARY_BANDS as IndustryPack["salaryBands"],
  salaryCurrency: "INR",
  salarySource: "India School of Fashion & Retail Fact Sheet (PayScale, Glassdoor, Indeed, Deloitte–FICCI, NSDC-AMH, RASCI, 2024–2026)",
  initiatives: INITIATIVES,
  certifications: CERTIFICATIONS,
  companies: COMPANIES,
};
