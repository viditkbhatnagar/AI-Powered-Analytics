import type { IndustryPack } from "./types";

// Convert LPA (Lakhs Per Annum) to annual INR. 1 LPA = 100,000 INR.
const lpa = (x: number) => Math.round(x * 100_000);

const DOMAINS = [
  { name: "Passenger Services", icon: "users", description: "Check-in, boarding, gate services and premium guest handling across departures and arrivals." },
  { name: "Ground Handling", icon: "luggage", description: "Ground staff operations, baggage handling, station services and turnaround support at airports." },
  { name: "Ramp & Turnaround", icon: "plane-takeoff", description: "Airside operations including aircraft turnaround, ramp coordination, load control and dispatch." },
  { name: "Cargo Operations", icon: "package", description: "Air cargo acceptance, documentation, warehouse coordination and hub operations for express freight." },
  { name: "Airport Operations", icon: "building", description: "Terminal operations, disruption management, SOP compliance, AVSEC and airside coordination." },
  { name: "Reservations & Ticketing", icon: "ticket", description: "Bookings, fares, reissues, refunds and commercial service desk operations for airlines and travel partners." },
  { name: "MRO", icon: "wrench", description: "Maintenance, Repair and Overhaul: line maintenance, base maintenance and component overhaul for civil aviation fleets." },
];

const SUBDOMAINS: Record<string, string[]> = {
  "Passenger Services": ["Check-in & Boarding", "Terminal Services", "Guest Services & Lounges"],
  "Ground Handling": ["Ground Operations", "Baggage Services"],
  "Ramp & Turnaround": ["Ramp Operations", "Load Control"],
  "Cargo Operations": ["Cargo Acceptance", "Cargo Documentation", "Warehouse & Hub Ops"],
  "Airport Operations": ["Terminal Operations", "AVSEC & Compliance"],
  "Reservations & Ticketing": ["Reservations", "Ticketing & Sales"],
  "MRO": ["Line Maintenance", "Base Maintenance"],
};

const SAMPLE_ROLES: Record<string, [string, string, string, string]> = {
  "Check-in & Boarding": ["Passenger Service Agent", "Shift Supervisor", "Terminal Duty Manager", "Senior Manager Airport Services"],
  "Terminal Services": ["Terminal Services Executive", "Gate Supervisor", "Terminal Operations Manager", "Head of Terminal"],
  "Guest Services & Lounges": ["Guest Services Executive", "Lounge Lead", "Guest Services Manager", "Head of Premium Services"],
  "Ground Operations": ["Ground Staff Associate", "Ground Ops Supervisor", "Ground Operations Manager", "GM Ground Operations"],
  "Baggage Services": ["Baggage Handler", "Baggage Services Lead", "Baggage Manager", "Head of Baggage"],
  "Ramp Operations": ["Ramp Agent", "Ramp Supervisor", "Ramp Manager", "Senior Manager Ground Operations"],
  "Load Control": ["Load Control Agent", "Load Control Lead", "Load Control Manager", "Head of Load Planning"],
  "Cargo Acceptance": ["Cargo Executive", "Cargo Supervisor", "Cargo Operations Manager", "Senior Manager Cargo"],
  "Cargo Documentation": ["Documentation Executive", "Documentation Lead", "Documentation Manager", "Head of Cargo Compliance"],
  "Warehouse & Hub Ops": ["Warehouse Associate", "Warehouse Supervisor", "Hub Operations Manager", "Head of Cargo Hub"],
  "Terminal Operations": ["Airport Operations Executive", "Duty Officer", "Airport Operations Manager", "Senior Manager Airport Operations"],
  "AVSEC & Compliance": ["AVSEC Officer", "AVSEC Supervisor", "Compliance Manager", "Head of Airport Compliance"],
  "Reservations": ["Reservations Agent", "Senior Reservations Agent", "Reservations Manager", "Head of Reservations"],
  "Ticketing & Sales": ["Ticketing Agent", "Commercial Supervisor", "Commercial Manager", "Senior Manager Commercial"],
  "Line Maintenance": ["Line Maintenance Technician", "Line Maintenance Engineer", "Line Maintenance Manager", "Head of Line Maintenance"],
  "Base Maintenance": ["Base Maintenance Technician", "Base Maintenance Engineer", "Base Maintenance Manager", "Head of Base Maintenance"],
};

// Annual INR bands per role level, mapped from the India School of Aviation fact sheet (entry / 3-7 yr / manager / senior manager).
const SALARY_BANDS = {
  "Passenger Services": { ENTRY: { min: lpa(3.2), max: lpa(4.5) }, MID: { min: lpa(4.8), max: lpa(9) }, SENIOR: { min: lpa(10), max: lpa(15) }, EXECUTIVE: { min: lpa(15), max: lpa(22) } },
  "Ground Handling": { ENTRY: { min: lpa(2.3), max: lpa(4.0) }, MID: { min: lpa(4.0), max: lpa(6.5) }, SENIOR: { min: lpa(7), max: lpa(11) }, EXECUTIVE: { min: lpa(11), max: lpa(17) } },
  "Ramp & Turnaround": { ENTRY: { min: lpa(3.0), max: lpa(4.3) }, MID: { min: lpa(4.8), max: lpa(9) }, SENIOR: { min: lpa(8), max: lpa(12.5) }, EXECUTIVE: { min: lpa(14), max: lpa(20) } },
  "Cargo Operations": { ENTRY: { min: lpa(3.0), max: lpa(4.5) }, MID: { min: lpa(4.8), max: lpa(8) }, SENIOR: { min: lpa(7), max: lpa(10) }, EXECUTIVE: { min: lpa(12), max: lpa(18) } },
  "Airport Operations": { ENTRY: { min: lpa(3.2), max: lpa(4.8) }, MID: { min: lpa(5.0), max: lpa(9) }, SENIOR: { min: lpa(9), max: lpa(14) }, EXECUTIVE: { min: lpa(15), max: lpa(24) } },
  "Reservations & Ticketing": { ENTRY: { min: lpa(3.0), max: lpa(4.5) }, MID: { min: lpa(4.8), max: lpa(8.5) }, SENIOR: { min: lpa(10), max: lpa(16) }, EXECUTIVE: { min: lpa(16), max: lpa(24) } },
  "MRO": { ENTRY: { min: lpa(3.5), max: lpa(5.0) }, MID: { min: lpa(6), max: lpa(10) }, SENIOR: { min: lpa(11), max: lpa(17) }, EXECUTIVE: { min: lpa(18), max: lpa(28) } },
} as const;

const INITIATIVES = [
  { scope: "India", name: "UDAN Regional Connectivity Scheme", domainsImpacted: ["Airport Operations", "Passenger Services", "Reservations & Ticketing"], timeframeStart: 2017, timeframeEnd: 2030, kpiTarget: "625 routes operationalised across 90 airports", category: "Policy", sourceUrl: "https://www.civilaviation.gov.in/en/regional-connectivity-scheme-udan" },
  { scope: "India", name: "Airport Network Expansion", domainsImpacted: ["Airport Operations", "Ground Handling", "Cargo Operations"], timeframeStart: 2014, timeframeEnd: 2030, kpiTarget: "74 → 159 airports (2014–2024), target 350–400 by 2047", category: "Infrastructure", sourceUrl: "https://www.aai.aero" },
  { scope: "India", name: "IndiGo 500-Aircraft A320 Order", domainsImpacted: ["Passenger Services", "Ramp & Turnaround", "MRO"], timeframeStart: 2023, timeframeEnd: 2035, kpiTarget: "500 Airbus A320 family aircraft", category: "Fleet", sourceUrl: "https://www.goindigo.in" },
  { scope: "India", name: "Air India 570-Aircraft Order Programme", domainsImpacted: ["Passenger Services", "Cargo Operations", "MRO"], timeframeStart: 2023, timeframeEnd: 2035, kpiTarget: "570 aircraft (470 Airbus+Boeing + 100 additional Airbus)", category: "Fleet", sourceUrl: "https://www.airindia.com" },
  { scope: "Noida (NCR)", name: "Noida International Airport Phase 1", domainsImpacted: ["Airport Operations", "Passenger Services", "Ground Handling"], timeframeStart: 2020, timeframeEnd: 2026, kpiTarget: "12 mppa launch, scalable to 70 mppa", category: "Infrastructure", sourceUrl: "https://www.nialairport.com" },
  { scope: "India", name: "12 New Terminal Buildings (March 2024)", domainsImpacted: ["Airport Operations", "Passenger Services"], timeframeStart: 2022, timeframeEnd: 2024, kpiTarget: "Added 6 crore PAX/yr capacity, ~₹8,900 cr investment", category: "Infrastructure", sourceUrl: "https://www.aai.aero" },
  { scope: "Navi Mumbai", name: "FedEx Navi Mumbai Cargo Hub", domainsImpacted: ["Cargo Operations"], timeframeStart: 2026, timeframeEnd: 2030, kpiTarget: "300,000 sq ft automated hub, >₹2,500 cr investment", category: "Cargo", sourceUrl: "https://www.fedex.com" },
  { scope: "India", name: "MRO Industry Push (5% IGST, 100% FDI)", domainsImpacted: ["MRO"], timeframeStart: 2024, timeframeEnd: 2035, kpiTarget: "US$9.5B MRO market by 2035", category: "Policy", sourceUrl: "https://www.civilaviation.gov.in" },
  { scope: "India", name: "Indian Commercial Fleet Triple-Up", domainsImpacted: ["Passenger Services", "MRO", "Ramp & Turnaround"], timeframeStart: 2024, timeframeEnd: 2035, kpiTarget: "834 → 2,250 aircraft by 2035 (Airbus forecast)", category: "Fleet", sourceUrl: "https://www.airbus.com" },
  { scope: "India", name: "PM Gati Shakti Multi-modal Aviation Linkage", domainsImpacted: ["Cargo Operations", "Airport Operations"], timeframeStart: 2021, timeframeEnd: 2030, kpiTarget: "Integrated multi-modal logistics including air cargo", category: "Policy", sourceUrl: "https://www.pmindia.gov.in" },
];

const CERTIFICATIONS = [
  { name: "DGCA Ground Handling Approval", provider: "DGCA (India)", description: "Directorate General of Civil Aviation approval framework for ground handling operations.", benefits: "Mandatory for licensed ground handling roles in India.", url: "https://www.dgca.gov.in", cost: 5000, durationMonths: 3 },
  { name: "BCAS AVSEC Basic", provider: "BCAS (India)", description: "Bureau of Civil Aviation Security basic aviation security training.", benefits: "Required for airside / restricted area access at Indian airports.", url: "https://bcasindia.gov.in", cost: 4000, durationMonths: 1 },
  { name: "BCAS Pre-Embarkation Security Check", provider: "BCAS (India)", description: "PESC certification for passenger and baggage screening.", benefits: "Entry pathway for AVSEC officer roles.", url: "https://bcasindia.gov.in", cost: 3500, durationMonths: 2 },
  { name: "IATA Foundation in Travel & Tourism", provider: "IATA", description: "Industry-recognised foundation diploma covering airlines, fares, ticketing and customer service.", benefits: "Strong base for reservations, ticketing and guest services careers.", url: "https://www.iata.org/training", cost: 35000, durationMonths: 6 },
  { name: "IATA Air Cargo Introductory", provider: "IATA", description: "Introductory air cargo operations and documentation course.", benefits: "Standard for cargo acceptance and documentation roles.", url: "https://www.iata.org/training", cost: 28000, durationMonths: 3 },
  { name: "IATA Dangerous Goods Regulations Cat 6", provider: "IATA", description: "DGR Category 6 awareness for passenger handling and acceptance staff.", benefits: "Compliance requirement for handling restricted articles.", url: "https://www.iata.org", cost: 18000, durationMonths: 1 },
  { name: "ICAO Safety Management Systems", provider: "ICAO", description: "ICAO-aligned SMS training for airport and airline operations staff.", benefits: "Global benchmark for safety culture roles.", url: "https://www.icao.int", cost: 22000, durationMonths: 2 },
  { name: "DGCA AME License (Cat A)", provider: "DGCA (India)", description: "Aircraft Maintenance Engineer Category A licence for line maintenance.", benefits: "Statutory licence to release aircraft for service.", url: "https://www.dgca.gov.in", cost: 250000, durationMonths: 24 },
];

const COMPANIES = [
  { name: "IndiGo", description: "India's largest airline by domestic passengers and cargo carrier.", website: "https://www.goindigo.in", domains: ["Passenger Services", "Reservations & Ticketing", "Ground Handling", "Cargo Operations"] },
  { name: "Air India", description: "National full-service carrier under the Tata Group with a 570-aircraft order programme.", website: "https://www.airindia.com", domains: ["Passenger Services", "Reservations & Ticketing", "Cargo Operations", "MRO"] },
  { name: "Air India Express", description: "Tata Group's value-carrier brand operating short and medium-haul routes.", website: "https://www.airindiaexpress.com", domains: ["Passenger Services", "Reservations & Ticketing"] },
  { name: "AI Airport Services (AIASL)", description: "Tata Group's unified ground handling subsidiary, present at 85+ Indian airports.", website: "https://www.aiasl.in", domains: ["Ground Handling", "Ramp & Turnaround", "Cargo Operations"] },
  { name: "AISATS", description: "Air India SATS – leading gateway services provider for passenger, ramp and cargo handling.", website: "https://www.aisats.in", domains: ["Ground Handling", "Ramp & Turnaround", "Cargo Operations"] },
  { name: "Airports Authority of India (AAI)", description: "Government-owned airport operator running most non-PPP airports in India.", website: "https://www.aai.aero", domains: ["Airport Operations", "Passenger Services"] },
  { name: "Adani Airports", description: "Private airport operator running Mumbai, Ahmedabad, Lucknow, Jaipur, Guwahati, Mangaluru and Thiruvananthapuram.", website: "https://www.adaniairports.com", domains: ["Airport Operations", "Passenger Services", "Cargo Operations"] },
  { name: "GMR Airports", description: "Operator of Delhi (DIAL) and Hyderabad (GHIAL) airports.", website: "https://www.gmrgroup.in", domains: ["Airport Operations", "Passenger Services", "Cargo Operations"] },
  { name: "FedEx India", description: "Global express operator investing >₹2,500 cr in a Navi Mumbai automated cargo hub.", website: "https://www.fedex.com/en-in", domains: ["Cargo Operations"] },
  { name: "Star Air", description: "Regional UDAN-era carrier connecting underserved cities.", website: "https://www.starair.in", domains: ["Passenger Services", "Reservations & Ticketing"] },
  { name: "Fly91", description: "Regional UDAN-focused airline launched 2024.", website: "https://www.fly91.in", domains: ["Passenger Services", "Reservations & Ticketing"] },
  { name: "Air Works", description: "Leading independent Indian MRO with line and base maintenance capabilities.", website: "https://www.airworks.in", domains: ["MRO"] },
];

export const indiaAviationPack: IndustryPack = {
  industry: {
    name: "Aviation (India)",
    description: "India's aviation careers ecosystem — passenger services, ground handling, cargo, airport operations and MRO across a market projected to triple its fleet to 2,250 aircraft by 2035.",
    icon: "plane",
  },
  domains: DOMAINS,
  subdomains: SUBDOMAINS,
  sampleRoles: SAMPLE_ROLES,
  salaryBands: SALARY_BANDS as IndustryPack["salaryBands"],
  salaryCurrency: "INR",
  salarySource: "India School of Aviation Fact Sheet (IATA, MoCA, DGCA, IndiGo/Air India, Indeed, SalaryExpert, 2024–2026)",
  initiatives: INITIATIVES,
  certifications: CERTIFICATIONS,
  companies: COMPANIES,
};
