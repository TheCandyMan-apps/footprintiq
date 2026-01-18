import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Download, ImageIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageConfig {
  key: string;
  filename: string;
  title: string;
  prompt: string;
}

const LENS_IMAGES: ImageConfig[] = [
  {
    key: "lens-confidence",
    filename: "lens-confidence.webp",
    title: "LENS Confidence Wrong",
    prompt: "Abstract digital visualization showing the contrast between binary (0/1, yes/no) and probabilistic thinking. Left side shows rigid black and white binary code, right side shows a spectrum gauge with smooth gradients from red through amber to green. Professional cybersecurity aesthetic with dark background, subtle grid lines, and soft glowing elements. Clean, modern, and analytical. No text. Ultra high resolution."
  },
  {
    key: "lens-case-study",
    filename: "lens-case-study.webp",
    title: "LENS Case Study",
    prompt: "Digital forensics concept showing a magnifying lens analyzing data profiles, with one profile highlighted in green (verified) and another faded with a red X (false positive prevented). Dark cyber aesthetic with abstract data streams and identity verification elements. Professional, trustworthy, analytical. No text or faces. Ultra high resolution."
  },
  {
    key: "lens-intro",
    filename: "lens-intro.webp",
    title: "LENS Introduction",
    prompt: "Abstract representation of an analysis layer or lens sitting above raw data, filtering and qualifying information. Visualize layers: bottom layer shows chaotic scattered data points, middle layer is a glowing translucent lens/filter, top layer shows organized qualified intelligence. Dark background with cyan and teal accent color highlights. Modern cyber-intelligence aesthetic. No text. Ultra high resolution."
  },
  {
    key: "lens-meaning",
    filename: "lens-meaning.webp",
    title: "LENS Confidence Meaning",
    prompt: "Abstract visualization of a confidence spectrum showing gradients from uncertainty to strong evidence. Four distinct bands ranging from grey/uncertain through amber/likely to green/strong confidence. Incorporate subtle probability curve elements and professional analytical gauges. Dark cyber aesthetic with clean lines. No text. Ultra high resolution."
  }
];

interface GeneratedImage {
  key: string;
  imageUrl: string;
  status: "pending" | "generating" | "success" | "error";
  error?: string;
}

export function LensImageGenerator() {
  const [images, setImages] = useState<Record<string, GeneratedImage>>({});
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  const generateImage = async (config: ImageConfig) => {
    setImages(prev => ({
      ...prev,
      [config.key]: { key: config.key, imageUrl: "", status: "generating" }
    }));

    try {
      const { data, error } = await supabase.functions.invoke("generate-lens-images", {
        body: { prompt: config.prompt, imageKey: config.key }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setImages(prev => ({
          ...prev,
          [config.key]: { key: config.key, imageUrl: data.imageUrl, status: "success" }
        }));
        toast.success(`Generated: ${config.title}`);
      } else {
        throw new Error(data?.error || "No image returned");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate";
      setImages(prev => ({
        ...prev,
        [config.key]: { key: config.key, imageUrl: "", status: "error", error: errorMessage }
      }));
      toast.error(`Failed: ${config.title} - ${errorMessage}`);
    }
  };

  const generateAll = async () => {
    setIsGeneratingAll(true);
    for (const config of LENS_IMAGES) {
      await generateImage(config);
      // Small delay between generations to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    setIsGeneratingAll(false);
    toast.success("All images generated!");
  };

  const downloadImage = async (config: ImageConfig) => {
    const imageData = images[config.key];
    if (!imageData?.imageUrl) return;

    try {
      // Convert base64 to blob
      const base64Data = imageData.imageUrl.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/webp" });

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = config.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Downloaded: ${config.filename}`);
    } catch (err) {
      toast.error("Failed to download image");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">LENS Blog Image Generator</h1>
        <p className="text-muted-foreground">
          Generate AI hero images for the 4 LENS blog posts. After generation, download each image 
          and place it in <code className="bg-muted px-1 rounded">public/blog-images/</code>
        </p>
      </div>

      <div className="mb-6">
        <Button 
          onClick={generateAll} 
          disabled={isGeneratingAll}
          size="lg"
          className="w-full sm:w-auto"
        >
          {isGeneratingAll ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating All Images...
            </>
          ) : (
            <>
              <ImageIcon className="mr-2 h-4 w-4" />
              Generate All 4 Images
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {LENS_IMAGES.map((config) => {
          const imageData = images[config.key];
          const isGenerating = imageData?.status === "generating";
          const hasImage = imageData?.status === "success" && imageData.imageUrl;
          const hasError = imageData?.status === "error";

          return (
            <Card key={config.key} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{config.title}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {config.filename}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasImage && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                    {hasError && (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preview area */}
                <div className="relative aspect-[3/2] bg-muted rounded-lg overflow-hidden border">
                  {isGenerating && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  {hasImage && (
                    <img 
                      src={imageData.imageUrl} 
                      alt={config.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {hasError && (
                    <div className="absolute inset-0 flex items-center justify-center text-destructive text-sm p-4 text-center">
                      {imageData.error}
                    </div>
                  )}
                  {!isGenerating && !hasImage && !hasError && (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-12 w-12 opacity-30" />
                    </div>
                  )}
                </div>

                {/* Prompt preview */}
                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded max-h-20 overflow-y-auto">
                  {config.prompt}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => generateImage(config)}
                    disabled={isGenerating || isGeneratingAll}
                    className="flex-1"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Generate"
                    )}
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => downloadImage(config)}
                    disabled={!hasImage}
                    className="flex-1"
                  >
                    <Download className="mr-1 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Next Steps:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
          <li>Generate all images using the button above</li>
          <li>Download each generated image</li>
          <li>Place the downloaded files in <code className="bg-background px-1 rounded">public/blog-images/</code></li>
          <li>Verify the images appear on the blog posts</li>
        </ol>
      </div>
    </div>
  );
}
