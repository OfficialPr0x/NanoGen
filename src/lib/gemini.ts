import { GoogleGenAI } from "@google/genai";

export type AspectRatio = "1:1" | "9:16" | "16:9";
export type VideoResolution = "720p" | "1080p";

export interface GenerationParams {
  prompt: string;
  aspectRatio: AspectRatio;
  image?: string; // base64
  mimeType?: string;
}

export interface VideoGenerationParams {
  prompt: string;
  aspectRatio: AspectRatio;
  resolution: VideoResolution;
}

export async function generateImage({ prompt, aspectRatio, image, mimeType }: GenerationParams) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  
  const contents = {
    parts: [
      ...(image ? [{ inlineData: { data: image, mimeType: mimeType || "image/png" } }] : []),
      { text: prompt },
    ],
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents,
    config: {
      imageConfig: {
        aspectRatio,
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No image was generated");
}

export async function generateVideo({ prompt, aspectRatio, resolution }: VideoGenerationParams) {
  const apiKey = process.env.GEMINI_API_KEY || "";
  const ai = new GoogleGenAI({ apiKey });

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-lite-generate-preview',
    prompt,
    config: {
      numberOfVideos: 1,
      resolution,
      aspectRatio
    }
  });

  // Poll for completion
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed - no URI returned");

  // Fetch the video with the API key
  const response = await fetch(downloadLink, {
    method: 'GET',
    headers: {
      'x-goog-api-key': apiKey,
    },
  });

  if (!response.ok) throw new Error("Failed to download generated video");

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
