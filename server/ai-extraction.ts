import OpenAI from "openai";
import xlsx from "xlsx";
import mammoth from "mammoth";

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI();
  }
  return openaiClient;
}

interface ExtractedData {
  industry: string;
  domains: string[];
  roles: { name: string; level: string; confidence: number }[];
  salaries: { domain: string; level: string; min: number; max: number; confidence: number }[];
  certifications: string[];
}

export async function extractDataWithAI(file: Express.Multer.File): Promise<ExtractedData> {
  const content = await parseFileContent(file);

  if (!content || content.trim().length === 0) {
    return {
      industry: "Supply Chain & Logistics",
      domains: [],
      roles: [],
      salaries: [],
      certifications: [],
    };
  }

  try {
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a data extraction specialist for the UAE Supply Chain & Logistics industry. 
Extract structured career data from the provided document content.

Return a JSON object with:
- industry: The detected industry (default to "Supply Chain & Logistics")
- domains: Array of domain names detected (e.g., "Road Freight", "Sea Freight", "Warehousing")
- roles: Array of objects with { name, level (ENTRY/MID/SENIOR/EXECUTIVE), confidence (0-1) }
- salaries: Array of objects with { domain, level, min, max, confidence (0-1) } in AED
- certifications: Array of certification names mentioned

Focus on UAE-specific data. All salary values should be in AED per month.`,
        },
        {
          role: "user",
          content: `Extract career data from this document:\n\n${content.slice(0, 10000)}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      industry: result.industry || "Supply Chain & Logistics",
      domains: result.domains || [],
      roles: result.roles || [],
      salaries: result.salaries || [],
      certifications: result.certifications || [],
    };
  } catch (error) {
    console.error("AI extraction error:", error);
    
    // Return basic extracted data on error
    return {
      industry: "Supply Chain & Logistics",
      domains: extractDomainsFromText(content),
      roles: extractRolesFromText(content),
      salaries: [],
      certifications: extractCertificationsFromText(content),
    };
  }
}

async function parseFileContent(file: Express.Multer.File): Promise<string> {
  const extension = file.originalname.split(".").pop()?.toLowerCase();

  try {
    if (extension === "csv") {
      return file.buffer.toString("utf-8");
    }

    if (extension === "xlsx" || extension === "xls") {
      const workbook = xlsx.read(file.buffer, { type: "buffer" });
      let content = "";
      
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];
        content += data.map((row) => row.join("\t")).join("\n") + "\n\n";
      }
      
      return content;
    }

    if (extension === "docx") {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return result.value;
    }

    return file.buffer.toString("utf-8");
  } catch (error) {
    console.error("File parsing error:", error);
    return "";
  }
}

function extractDomainsFromText(text: string): string[] {
  const domainKeywords = [
    "Road Freight", "Sea Freight", "Air Freight", "Rail", "Ports",
    "Freight Forwarding", "Customs", "Warehousing", "3PL", "4PL",
    "Last-Mile", "E-commerce", "Cold Chain", "Project Logistics",
    "Industrial", "Free Zones", "Supply Chain Planning", "Technology"
  ];

  const found: string[] = [];
  const lowerText = text.toLowerCase();
  
  for (const domain of domainKeywords) {
    if (lowerText.includes(domain.toLowerCase())) {
      found.push(domain);
    }
  }

  return [...new Set(found)];
}

function extractRolesFromText(text: string): { name: string; level: string; confidence: number }[] {
  const roles: { name: string; level: string; confidence: number }[] = [];
  
  const rolePatterns = [
    { pattern: /manager|head|director|vp|ceo|coo|cfo/gi, level: "SENIOR" },
    { pattern: /coordinator|executive|analyst|specialist/gi, level: "MID" },
    { pattern: /assistant|trainee|intern|junior/gi, level: "ENTRY" },
    { pattern: /chief|president|officer/gi, level: "EXECUTIVE" },
  ];

  const lines = text.split("\n");
  
  for (const line of lines) {
    for (const { pattern, level } of rolePatterns) {
      if (pattern.test(line) && line.length < 100) {
        roles.push({
          name: line.trim().slice(0, 50),
          level,
          confidence: 0.7,
        });
        break;
      }
    }
  }

  return roles.slice(0, 20);
}

function extractCertificationsFromText(text: string): string[] {
  const certKeywords = [
    "CSCP", "CPIM", "CIPS", "IATA", "FIATA", "PMP", "Six Sigma",
    "Green Belt", "Black Belt", "APICS", "ISM", "CSCMP"
  ];

  const found: string[] = [];
  const upperText = text.toUpperCase();
  
  for (const cert of certKeywords) {
    if (upperText.includes(cert.toUpperCase())) {
      found.push(cert);
    }
  }

  return [...new Set(found)];
}
