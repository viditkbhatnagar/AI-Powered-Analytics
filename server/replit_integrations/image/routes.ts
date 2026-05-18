import type { Express, Request, Response } from "express";
import { openai } from "./client";
import { storage } from "../../storage";

// Light-touch styling cues per industry so generated images feel on-brand for the active vertical.
const INDUSTRY_VISUAL_HINTS: Record<string, string> = {
  "Supply Chain & Logistics":
    "Modern UAE supply chain and logistics aesthetic: ports, cranes, container ships, warehouses, trucks; clean editorial photography style; muted blues, sand and gold tones.",
  "Aviation (India)":
    "Modern Indian aviation aesthetic: airports, ground handling, ramp operations, cargo hubs; uniformed crew; editorial photography style; cobalt blue, warm white and saffron accents.",
  "Fashion & Retail (India)":
    "Modern Indian fashion and retail aesthetic: store interiors, visual merchandising, runway studios, e-commerce catalogue shots; editorial style; warm neutrals with pops of magenta and emerald.",
};

export function registerImageRoutes(app: Express): void {
  app.post("/api/generate-image", async (req: Request, res: Response) => {
    try {
      const { prompt, size = "1024x1024", industryId } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      // If an industry is active, append a short styling hint so the output reflects this vertical.
      let finalPrompt: string = prompt;
      const industryIdNum = typeof industryId === "number" ? industryId : Number(industryId);
      if (Number.isFinite(industryIdNum) && industryIdNum > 0) {
        const industry = await storage.getIndustryById(industryIdNum);
        if (industry) {
          const hint = INDUSTRY_VISUAL_HINTS[industry.name] ?? `Themed for ${industry.name}.`;
          finalPrompt = `${prompt}\n\nContext: this image is for the ${industry.name} vertical of an analytics platform. Visual direction: ${hint}`;
        }
      }

      const response = await openai.images.generate({
        model: "gpt-image-1",
        prompt: finalPrompt,
        n: 1,
        size: size as "1024x1024" | "1024x1536" | "1536x1024" | "auto",
      });

      const imageData = response.data?.[0];
      if (!imageData) {
        return res.status(502).json({ error: "No image returned" });
      }
      res.json({
        url: imageData.url,
        b64_json: imageData.b64_json,
      });
    } catch (error: any) {
      console.error("Error generating image:", error?.message ?? error);
      res.status(500).json({ error: error?.message ?? "Failed to generate image" });
    }
  });
}

