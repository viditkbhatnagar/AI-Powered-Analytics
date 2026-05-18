import fs from "node:fs";
import OpenAI, { toFile } from "openai";
import { Buffer } from "node:buffer";

export const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

// gpt-image-1 is the current OpenAI image model. It returns b64_json by default and
// supports the sizes below. dall-e-3 isn't enabled on this account; gpt-image-1 is.
export type ImageSize = "1024x1024" | "1024x1536" | "1536x1024" | "auto";

async function fetchUrlAsBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Image fetch failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

export async function generateImageBuffer(
  prompt: string,
  size: ImageSize = "1024x1024"
): Promise<Buffer> {
  const response = await openai.images.generate({
    model: "gpt-image-1",
    prompt,
    size,
  });
  const first = response.data?.[0];
  if (first?.b64_json) return Buffer.from(first.b64_json, "base64");
  if (first?.url) return fetchUrlAsBuffer(first.url);
  throw new Error("No image data returned from gpt-image-1");
}

export async function editImages(
  imageFiles: string[],
  prompt: string,
  outputPath?: string
): Promise<Buffer> {
  const images = await Promise.all(
    imageFiles.map((file) =>
      toFile(fs.createReadStream(file), file, {
        type: "image/png",
      })
    )
  );

  const response = await openai.images.edit({
    model: "gpt-image-1",
    image: images,
    prompt,
  });

  const first = response.data?.[0];
  const imageBytes = first?.b64_json
    ? Buffer.from(first.b64_json, "base64")
    : first?.url
      ? await fetchUrlAsBuffer(first.url)
      : Buffer.alloc(0);

  if (outputPath) {
    fs.writeFileSync(outputPath, imageBytes);
  }

  return imageBytes;
}

