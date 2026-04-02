export type AspectRatio = "1:1" | "9:16" | "16:9";
export type VideoResolution = "720p" | "1080p";

export interface KieVideoParams {
  prompt: string;
  aspectRatio: AspectRatio;
  resolution: VideoResolution;
  apiKey: string;
}

export async function generateKieVideo({ prompt, aspectRatio, resolution, apiKey }: KieVideoParams) {
  // Kie.ai API typically follows an OpenAI-like structure or a custom one.
  // Based on common patterns for these wrappers:
  
  const response = await fetch('/api/kie/v1/video/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'veo-3.1-lite', // or the specific model ID from Kie
      prompt,
      aspect_ratio: aspectRatio,
      resolution,
      // Add other Kie-specific params if needed
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Kie API error: ${response.status}`);
  }

  const data = await response.json();
  
  // Kie usually returns a task ID or a direct URL
  // If it's a task ID, we'd need to poll. 
  // For this implementation, we'll assume it returns a result or we poll if needed.
  
  if (data.url) return data.url;
  
  if (data.id) {
    // Polling logic for Kie
    let status = 'pending';
    let resultUrl = '';
    
    while (status !== 'completed' && status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 5000));
      const pollRes = await fetch(`/api/kie/v1/video/generations/${data.id}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      const pollData = await pollRes.json();
      status = pollData.status;
      if (status === 'completed') resultUrl = pollData.url;
      if (status === 'failed') throw new Error(pollData.error || 'Generation failed');
    }
    return resultUrl;
  }

  throw new Error('Unexpected response from Kie API');
}
