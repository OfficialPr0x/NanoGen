export type AspectRatio = "1:1" | "9:16" | "16:9";
export type VideoResolution = "720p" | "1080p";
export type VideoModel =
  | 'kling-v2.1-pro'
  | 'kling-v2.5'
  | 'sora-2-pro'
  | 'bytedance-v1-pro'
  | 'bytedance-v1-lite'
  | 'hailuo-2.3-pro'
  | 'wan-2.6'
  | 'wan-2.6-turbo'
  | 'grok-video';

export interface KieVideoParams {
  prompt: string;
  aspectRatio: AspectRatio;
  resolution: VideoResolution;
  model: VideoModel;
  apiKey: string;
}

const MAX_POLL_ATTEMPTS = 120; // ~10 minutes at 5s intervals
const POLL_INTERVAL_MS = 5000;

export async function generateKieVideo({ prompt, aspectRatio, resolution, model, apiKey }: KieVideoParams) {
  const response = await fetch('/api/kie/api/v1/jobs/createTask', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      prompt,
      aspect_ratio: aspectRatio,
      resolution,
    })
  });

  if (response.status === 429) {
    throw new Error('Rate limit exceeded. KIE allows up to 20 requests per 10 seconds. Please wait and try again.');
  }

  if (response.status === 401) {
    throw new Error('Authentication failed. Please check your KIE API key in Settings.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.msg || error.message || `KIE API error: ${response.status}`);
  }

  const data = await response.json();

  // KIE uses an async task model — HTTP 200 only means the task was created.
  // The response contains a task_id that must be polled for the final result.
  const taskId = data.task_id || data.id;

  if (data.url) return data.url;

  if (!taskId) {
    throw new Error('Unexpected response from KIE API: no task_id returned');
  }

  let attempts = 0;
  while (attempts < MAX_POLL_ATTEMPTS) {
    attempts++;
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));

    const pollRes = await fetch(`/api/kie/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!pollRes.ok) {
      if (pollRes.status === 429) {
        // Back off on rate limit during polling
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS * 2));
        continue;
      }
      throw new Error(`KIE polling error: ${pollRes.status}`);
    }

    const pollData = await pollRes.json();
    const status = pollData.status;

    if (status === 'completed' || status === 'success') {
      const resultUrl = pollData.url || pollData.result?.url || pollData.output?.url;
      if (resultUrl) return resultUrl;
      throw new Error('Task completed but no media URL found in response');
    }

    if (status === 'failed' || status === 'error') {
      throw new Error(pollData.error || pollData.msg || 'Video generation failed');
    }
  }

  throw new Error('Video generation timed out. Check task status at https://kie.ai/logs');
}
