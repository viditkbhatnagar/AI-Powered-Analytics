import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Image, Loader2, Download, Trash2, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface GeneratedImage {
  id: string;
  prompt: string;
  url: string;
  size: string;
  createdAt: string;
}

const STORAGE_KEY = "ai-powered-analytics-generated-images";

function loadGallery(): GeneratedImage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveGallery(images: GeneratedImage[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
}

export default function AiImagesPage() {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState("1024x1024");
  const [gallery, setGallery] = useState<GeneratedImage[]>(() => loadGallery());

  useEffect(() => {
    saveGallery(gallery);
  }, [gallery]);

  const generateImage = useMutation({
    mutationFn: async ({ prompt, size }: { prompt: string; size: string }) => {
      const res = await apiRequest("POST", "/api/generate-image", { prompt, size });
      return res.json();
    },
    onSuccess: (data: { url?: string; b64_json?: string }) => {
      const imageUrl = data.url || (data.b64_json ? `data:image/png;base64,${data.b64_json}` : "");
      if (imageUrl) {
        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          prompt,
          url: imageUrl,
          size,
          createdAt: new Date().toISOString(),
        };
        setGallery((prev) => [newImage, ...prev]);
        setPrompt("");
      }
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    generateImage.mutate({ prompt: prompt.trim(), size });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const removeImage = (id: string) => {
    setGallery((prev) => prev.filter((img) => img.id !== id));
  };

  const clearGallery = () => {
    setGallery([]);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Image Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the image you want to generate..."
              disabled={generateImage.isPending}
              className="flex-1"
            />
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1024x1024">Square</SelectItem>
                <SelectItem value="1024x1792">Portrait</SelectItem>
                <SelectItem value="1792x1024">Landscape</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || generateImage.isPending}
              className="gap-2"
            >
              {generateImage.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generate
            </Button>
          </div>

          {generateImage.isError && (
            <p className="text-sm text-destructive">
              Failed to generate image. Please try again.
            </p>
          )}

          {/* Currently generating preview */}
          {generateImage.isPending && (
            <div className="flex items-center justify-center p-12 border rounded-lg bg-muted/30">
              <div className="text-center space-y-3">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">
                  Generating your image...
                </p>
                <p className="text-xs text-muted-foreground">
                  This may take 10-30 seconds
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gallery */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Generated Images ({gallery.length})
          </h2>
          {gallery.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearGallery} className="gap-2">
              <Trash2 className="h-3 w-3" />
              Clear All
            </Button>
          )}
        </div>

        {gallery.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Image className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-center">
                No images generated yet. Enter a prompt above to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gallery.map((img) => (
              <Card key={img.id} className="overflow-hidden group">
                <div className="relative aspect-square">
                  <img
                    src={img.url}
                    alt={img.prompt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      asChild
                    >
                      <a href={img.url} download={`ai-image-${img.id}.png`} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeImage(img.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="text-sm truncate" title={img.prompt}>
                    {img.prompt}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {img.size} &middot; {new Date(img.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
