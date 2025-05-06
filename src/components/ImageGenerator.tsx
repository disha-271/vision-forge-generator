
import React, { useState } from 'react';
import { Loader, Download, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface StyleOption {
  id: string;
  label: string;
  value: string;
}

const styleOptions: StyleOption[] = [
  { id: 'default', label: 'Default', value: '' },
  { id: 'pixel', label: 'Pixel Art', value: 'pixel art' },
  { id: 'painting', label: 'Oil Painting', value: 'oil painting' },
  { id: 'sketch', label: 'Sketch', value: 'sketch' },
  { id: 'watercolor', label: 'Watercolor', value: 'watercolor' },
  { id: 'anime', label: 'Anime', value: 'anime' }
];

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const { toast } = useToast();

  // Hugging Face API token and model
  const HF_TOKEN = import.meta.env.VITE_HF_TOKEN || "";
  const MODEL = "stabilityai/stable-diffusion-xl-base-1.0";

  const handleStyleChange = (value: string) => {
    setSelectedStyle(value);
  };

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Prompt required",
        description: "Please enter a description for your image"
      });
      return;
    }

    if (!HF_TOKEN) {
      toast({
        variant: "destructive",
        title: "API Key Missing",
        description: "Hugging Face API key is not configured"
      });
      return;
    }

    setIsLoading(true);
    setImageUrl('');

    try {
      // Combine prompt with style if selected
      const fullPrompt = selectedStyle
        ? `${prompt.trim()}, ${selectedStyle} style`
        : prompt.trim();

      const imageUrl = await queryHuggingFace(fullPrompt);
      setImageUrl(imageUrl);

      toast({
        title: "Image created successfully!",
        description: "Your AI-generated image is ready"
      });
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate image"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const queryHuggingFace = async (prompt: string): Promise<string> => {
    const API_URL = `https://api-inference.huggingface.co/models/${MODEL}`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: prompt
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "API request failed");
    }

    const imageBlob = await response.blob();
    return URL.createObjectURL(imageBlob);
  };

  const handleTryAgain = () => {
    generateImage();
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-3">
          AI Image Generator
        </h1>
        <p className="text-muted-foreground">
          Transform your imagination into stunning visuals with AI
        </p>
      </div>

      <div className="glass-card rounded-lg p-6 space-y-6 shadow-lg">
        <div className="space-y-4">
          <label htmlFor="prompt" className="block text-sm font-medium text-foreground">
            Describe your image
          </label>
          <Textarea
            id="prompt"
            placeholder="A futuristic cityscape with flying cars and neon lights..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px] bg-secondary/50"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">Choose a style</label>
          <ToggleGroup type="single" value={selectedStyle} onValueChange={handleStyleChange} className="flex flex-wrap gap-2">
            {styleOptions.map((style) => (
              <ToggleGroupItem
                key={style.id}
                value={style.value}
                className="rounded-md px-3 py-1.5 text-sm"
              >
                {style.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <Button
          onClick={generateImage}
          disabled={isLoading || !prompt.trim()}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Image"
          )}
        </Button>
      </div>

      {isLoading && (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 animate-pulse-slow">
            <div className="w-8 h-8 rounded-full border-2 border-r-transparent border-primary animate-spin" />
          </div>
          <p className="mt-3 text-muted-foreground">Transforming your idea into an image...</p>
        </div>
      )}

      {imageUrl && (
        <div className="mt-8 space-y-4 animate-fade-in">
          <div className="image-container aspect-square sm:aspect-video">
            <img
              src={imageUrl}
              alt="AI generated image based on your description"
              className="w-full h-full object-cover rounded-lg shadow-lg"
            />
          </div>
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <a href={imageUrl} download="ai-generated-image.png">
                <Download className="h-4 w-4 mr-2" />
                Download
              </a>
            </Button>
            <Button variant="outline" size="sm" onClick={handleTryAgain}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate New
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;
