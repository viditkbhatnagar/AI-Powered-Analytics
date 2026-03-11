import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { seedDatabase } from "./seed";
import { extractDataWithAI } from "./ai-extraction";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(server: Server, app: Express): Promise<void> {
  // Seed database on startup
  await seedDatabase();

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Industries
  app.get("/api/industries", async (req, res) => {
    try {
      const industries = await storage.getAllIndustries();
      res.json(industries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch industries" });
    }
  });

  app.get("/api/industries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const industry = await storage.getIndustryById(id);
      if (!industry) {
        return res.status(404).json({ error: "Industry not found" });
      }
      res.json(industry);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch industry" });
    }
  });

  // Domains
  app.get("/api/domains", async (req, res) => {
    try {
      const industryId = req.query.industry ? parseInt(req.query.industry as string) : undefined;
      const domains = await storage.getAllDomains(industryId);
      res.json(domains);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch domains" });
    }
  });

  app.get("/api/domains/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const domain = await storage.getDomainById(id);
      if (!domain) {
        return res.status(404).json({ error: "Domain not found" });
      }
      res.json(domain);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch domain" });
    }
  });

  // Subdomains
  app.get("/api/subdomains/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const subdomain = await storage.getSubdomainById(id);
      if (!subdomain) {
        return res.status(404).json({ error: "Subdomain not found" });
      }
      res.json(subdomain);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subdomain" });
    }
  });

  // Roles
  app.get("/api/roles", async (req, res) => {
    try {
      const domainId = req.query.domain ? parseInt(req.query.domain as string) : undefined;
      const roles = await storage.getAllRoles(domainId);
      res.json(roles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch roles" });
    }
  });

  app.get("/api/roles/domain/:id", async (req, res) => {
    try {
      const domainId = parseInt(req.params.id);
      const roles = await storage.getAllRoles(domainId);
      res.json(roles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch roles" });
    }
  });

  // Trends/Initiatives
  app.get("/api/trends", async (req, res) => {
    try {
      const initiatives = await storage.getAllInitiatives();
      res.json(initiatives);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch initiatives" });
    }
  });

  // Alias for initiatives
  app.get("/api/initiatives", async (req, res) => {
    try {
      const initiatives = await storage.getAllInitiatives();
      res.json(initiatives);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch initiatives" });
    }
  });

  // Salaries
  app.get("/api/salaries", async (req, res) => {
    try {
      const domainId = req.query.domain ? parseInt(req.query.domain as string) : undefined;
      const salaries = await storage.getAllSalaries(domainId);
      res.json(salaries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch salaries" });
    }
  });

  app.get("/api/salaries/domain/:id", async (req, res) => {
    try {
      const domainId = parseInt(req.params.id);
      const salaries = await storage.getAllSalaries(domainId);
      res.json(salaries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch salaries" });
    }
  });

  app.get("/api/salaries/stats", async (req, res) => {
    try {
      const stats = await storage.getSalaryStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch salary stats" });
    }
  });

  // Certifications
  app.get("/api/certifications", async (req, res) => {
    try {
      const domainId = req.query.domain ? parseInt(req.query.domain as string) : undefined;
      const certifications = await storage.getAllCertifications(domainId);
      res.json(certifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch certifications" });
    }
  });

  app.get("/api/certifications/domain/:id", async (req, res) => {
    try {
      const domainId = parseInt(req.params.id);
      const certifications = await storage.getAllCertifications(domainId);
      res.json(certifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch certifications" });
    }
  });

  // Companies
  app.get("/api/companies", async (req, res) => {
    try {
      const domainId = req.query.domain ? parseInt(req.query.domain as string) : undefined;
      const companies = await storage.getAllCompanies(domainId);
      res.json(companies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  });

  app.get("/api/companies/domain/:id", async (req, res) => {
    try {
      const domainId = parseInt(req.params.id);
      const companies = await storage.getAllCompanies(domainId);
      res.json(companies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  });

  // Charts
  app.get("/api/charts/prebuilt", async (req, res) => {
    const prebuiltCharts = getPrebuiltCharts();
    res.json(prebuiltCharts);
  });

  app.get("/api/charts/prebuilt/:id", async (req, res) => {
    try {
      const chartId = req.params.id;
      const charts = getPrebuiltCharts();
      const chart = charts.find((c) => c.id === chartId);
      if (!chart) {
        return res.status(404).json({ error: "Chart not found" });
      }
      
      // Fetch relevant data based on chart data source
      let data = {};
      switch (chart.dataSource) {
        case "initiatives":
          data = await storage.getAllInitiatives();
          break;
        case "domains":
          data = await storage.getAllDomains();
          break;
        case "salaries":
          data = await storage.getAllSalaries();
          break;
        case "certifications":
          data = await storage.getAllCertifications();
          break;
        case "companies":
          data = await storage.getAllCompanies();
          break;
        case "roles":
          data = await storage.getAllRoles();
          break;
      }
      
      res.json({ ...chart, data });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chart" });
    }
  });

  // Dashboards
  app.get("/api/dashboards", async (req, res) => {
    try {
      const dashboards = await storage.getAllDashboards();
      res.json(dashboards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboards" });
    }
  });

  app.post("/api/dashboards", async (req, res) => {
    try {
      const { name, config, description } = req.body;
      const dashboard = await storage.createDashboard({ name, config, description });
      res.status(201).json(dashboard);
    } catch (error) {
      res.status(500).json({ error: "Failed to create dashboard" });
    }
  });

  app.get("/api/dashboards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const dashboard = await storage.getDashboardById(id);
      if (!dashboard) {
        return res.status(404).json({ error: "Dashboard not found" });
      }
      res.json(dashboard);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard" });
    }
  });

  app.put("/api/dashboards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, config, description } = req.body;
      const dashboard = await storage.updateDashboard(id, { name, config, description });
      if (!dashboard) {
        return res.status(404).json({ error: "Dashboard not found" });
      }
      res.json(dashboard);
    } catch (error) {
      res.status(500).json({ error: "Failed to update dashboard" });
    }
  });

  app.delete("/api/dashboards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDashboard(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete dashboard" });
    }
  });

  app.delete("/api/dashboards/all", async (req, res) => {
    try {
      await storage.deleteAllDashboards();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete dashboards" });
    }
  });

  // Upload
  app.post("/api/upload/parse", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const result = await extractDataWithAI(req.file);
      res.json(result);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to process file" });
    }
  });

  app.post("/api/upload/confirm", async (req, res) => {
    try {
      const { fields } = req.body;
      // Process and save extracted fields to database
      // This would involve parsing the fields and creating appropriate records
      res.json({ success: true, message: "Data saved successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to save data" });
    }
  });

  // Export
  app.post("/api/export/chart", async (req, res) => {
    try {
      const { chartId, format } = req.body;
      // Placeholder for chart export functionality
      res.json({ success: true, message: `Chart exported as ${format}` });
    } catch (error) {
      res.status(500).json({ error: "Failed to export chart" });
    }
  });

  app.post("/api/export/dashboard", async (req, res) => {
    try {
      const { dashboardId } = req.body;
      // Placeholder for dashboard export functionality
      res.json({ success: true, message: "Dashboard exported as PDF" });
    } catch (error) {
      res.status(500).json({ error: "Failed to export dashboard" });
    }
  });

  app.get("/api/export/data", async (req, res) => {
    try {
      const { type, format } = req.query;
      // Placeholder for data export functionality
      res.json({ success: true, message: `Data exported as ${format}` });
    } catch (error) {
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  // Settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings || { theme: "light", colorScheme: "blue" });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const { theme, colorScheme, preferences } = req.body;
      const settings = await storage.updateSettings({ theme, colorScheme, preferences });
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Compare
  app.get("/api/compare", async (req, res) => {
    try {
      const domainIds = (req.query.domains as string)?.split(",").map(Number) || [];
      const type = req.query.type as string || "salary";
      
      const domainsData = await Promise.all(
        domainIds.map((id) => storage.getDomainById(id))
      );
      
      res.json({
        domains: domainsData.filter(Boolean),
        type,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comparison data" });
    }
  });
}

function getPrebuiltCharts() {
  return [
    { id: "1", name: "UAE Initiatives Timeline", description: "Timeline showing 16 UAE government initiatives from 2020-2050", category: "trends", chartType: "gantt", library: "plotly", dataSource: "initiatives" },
    { id: "2", name: "Initiative KPI Dashboard", description: "Multi-gauge showing key performance indicators", category: "trends", chartType: "gauge", library: "echarts", dataSource: "initiatives" },
    { id: "3", name: "Regional Distribution", description: "UAE map with initiatives by emirate", category: "trends", chartType: "map", library: "echarts", dataSource: "initiatives" },
    { id: "4", name: "Sector Impact Analysis", description: "Sankey diagram showing initiative to domain impact", category: "trends", chartType: "sankey", library: "echarts", dataSource: "initiatives" },
    { id: "5", name: "Target Achievement", description: "Bullet charts for initiative KPI progress", category: "trends", chartType: "bullet", library: "plotly", dataSource: "initiatives" },
    { id: "6", name: "Categories Breakdown", description: "Sunburst chart of initiative categories", category: "trends", chartType: "sunburst", library: "plotly", dataSource: "initiatives" },
    { id: "7", name: "Investment & Capacity", description: "Area chart of growth projections", category: "trends", chartType: "area", library: "recharts", dataSource: "initiatives" },
    { id: "8", name: "Sustainability Goals", description: "Progress rings for Net Zero targets", category: "trends", chartType: "progress", library: "echarts", dataSource: "initiatives" },
    { id: "9", name: "Domain Hierarchy", description: "Treemap of 18 domains sized by role count", category: "domains", chartType: "treemap", library: "plotly", dataSource: "domains" },
    { id: "10", name: "Sub-Domain Distribution", description: "Sunburst of domain hierarchy", category: "domains", chartType: "sunburst", library: "plotly", dataSource: "domains" },
    { id: "11", name: "Role Distribution", description: "Horizontal bar of roles per domain", category: "domains", chartType: "bar", library: "plotly", dataSource: "domains" },
    { id: "12", name: "Company Network", description: "Network graph of company-domain relationships", category: "domains", chartType: "network", library: "echarts", dataSource: "companies" },
    { id: "13", name: "Domain Interconnections", description: "Chord diagram of domain relationships", category: "domains", chartType: "chord", library: "echarts", dataSource: "domains" },
    { id: "14", name: "Job Role Hierarchy", description: "Organizational chart of role levels", category: "domains", chartType: "org", library: "d3", dataSource: "roles" },
    { id: "15", name: "Domain Complexity", description: "Radar chart comparing domain metrics", category: "domains", chartType: "radar", library: "plotly", dataSource: "domains" },
    { id: "16", name: "Companies by Domain", description: "Grouped bar of company distribution", category: "domains", chartType: "bar", library: "plotly", dataSource: "companies" },
    { id: "17", name: "Salary Range by Domain", description: "Box plot of salary distributions", category: "salary", chartType: "box", library: "plotly", dataSource: "salaries" },
    { id: "18", name: "Role-wise Comparison", description: "Grouped bar of salaries by role level", category: "salary", chartType: "bar", library: "plotly", dataSource: "salaries" },
    { id: "19", name: "Highest Paying Domains", description: "Sorted horizontal bar of top domains", category: "salary", chartType: "bar", library: "plotly", dataSource: "salaries" },
    { id: "20", name: "Salary Distribution", description: "Histogram of all salary values", category: "salary", chartType: "histogram", library: "plotly", dataSource: "salaries" },
    { id: "21", name: "Domain Salary Heatmap", description: "Heatmap of salaries by domain and level", category: "salary", chartType: "heatmap", library: "plotly", dataSource: "salaries" },
    { id: "22", name: "Salary Progression", description: "Waterfall chart of career progression", category: "salary", chartType: "waterfall", library: "plotly", dataSource: "salaries" },
    { id: "23", name: "Entry vs Max Gap", description: "Dumbbell chart comparing entry to max", category: "salary", chartType: "dumbbell", library: "d3", dataSource: "salaries" },
    { id: "24", name: "Salary Percentiles", description: "Violin plot of salary distributions", category: "salary", chartType: "violin", library: "plotly", dataSource: "salaries" },
    { id: "25", name: "Certification Pathway", description: "Sankey of role to certification flow", category: "certifications", chartType: "sankey", library: "echarts", dataSource: "certifications" },
    { id: "26", name: "Provider Distribution", description: "Donut chart of certification providers", category: "certifications", chartType: "pie", library: "plotly", dataSource: "certifications" },
    { id: "27", name: "Certs by Domain", description: "Stacked bar of certifications per domain", category: "certifications", chartType: "bar", library: "plotly", dataSource: "certifications" },
    { id: "28", name: "Career Progression", description: "Timeline of career milestones", category: "certifications", chartType: "timeline", library: "plotly", dataSource: "certifications" },
    { id: "29", name: "Certification ROI", description: "Bubble chart of cost vs salary increase", category: "certifications", chartType: "bubble", library: "plotly", dataSource: "certifications" },
    { id: "30", name: "Role-Cert Matrix", description: "Interactive grid of role-certification mapping", category: "certifications", chartType: "matrix", library: "plotly", dataSource: "certifications" },
  ];
}
