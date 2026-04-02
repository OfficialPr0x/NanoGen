export type AspectRatio = "9:16" | "16:9" | "Auto";
export type VideoResolution = "720p" | "1080p";

// Veo 3.1 models use the dedicated /api/v1/veo/generate endpoint
export type VeoModel = 'veo3' | 'veo3_fast' | 'veo3_lite';
// Other market models use the unified /api/v1/jobs/createTask endpoint
export type MarketVideoModel =
  | 'kling-v2.1-pro'
  | 'kling-v2.5'
  | 'sora-2-pro'
  | 'bytedance-v1-pro'
  | 'bytedance-v1-lite'
  | 'hailuo-2.3-pro'
  | 'wan-2.6'
  | 'wan-2.6-turbo'
  | 'grok-video';

export type VideoModel = VeoModel | MarketVideoModel;

const VEO_MODELS: Set<string> = new Set(['veo3', 'veo3_fast', 'veo3_lite']);

export type GenerationType = 'TEXT_2_VIDEO' | 'FIRST_AND_LAST_FRAMES_2_VIDEO' | 'REFERENCE_2_VIDEO';

export interface KieVideoParams {
  prompt: string;
  aspectRatio: AspectRatio;
  resolution: VideoResolution;
  model: VideoModel;
  apiKey: string;
  imageUrls?: string[];
  generationType?: GenerationType;
}

const MAX_POLL_ATTEMPTS = 120; // ~10 minutes at 5s intervals
const POLL_INTERVAL_MS = 5000;

function isVeoModel(model: string): model is VeoModel {
  return VEO_MODELS.has(model);
}

export async function generateKieVideo({ prompt, aspectRatio, resolution, model, apiKey, imageUrls, generationType }: KieVideoParams) {
  const isVeo = isVeoModel(model);

  const endpoint = isVeo
    ? '/api/kie/api/v1/veo/generate'
    : '/api/kie/api/v1/jobs/createTask';

  const body = isVeo
    ? {
        prompt,
        model,
        aspect_ratio: aspectRatio,
        ...(imageUrls?.length ? { imageUrls } : {}),
        ...(generationType ? { generationType } : {}),
        enableTranslation: true,
      }
    : {
        prompt,
        model,
        aspect_ratio: aspectRatio,
        resolution,
      };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (response.status === 429) {
    throw new Error('Rate limit exceeded. KIE allows up to 20 requests per 10 seconds. Please wait and try again.');
  }

  if (response.status === 401) {
    throw new Error('Authentication failed. Please check your KIE API key in Settings.');
  }

  const result = await response.json().catch(() => ({}));

  // Veo returns { code, msg, data: { taskId } } even on HTTP 200
  if (result.code && result.code !== 200) {
    const errorMap: Record<number, string> = {
      402: 'Insufficient credits. Top up at https://kie.ai/pricing',
      422: result.msg || 'Request validation failed',
      455: 'KIE service is under maintenance. Try again later.',
      501: 'Video generation failed',
      505: 'This feature is currently disabled',
    };
    throw new Error(errorMap[result.code] || result.msg || `KIE API error: ${result.code}`);
  }

  if (!response.ok) {
    throw new Error(result.msg || `KIE API error: ${response.status}`);
  }

  // Extract task ID — Veo nests under data.taskId, unified API may use task_id or id
  const taskId = result.data?.taskId || result.task_id || result.id;

  if (!taskId) {
    throw new Error('Unexpected response from KIE API: no taskId returned');
  }

  // Poll recordInfo until completion
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
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS * 2));
        continue;
      }
      throw new Error(`KIE polling error: ${pollRes.status}`);
    }

    const pollData = await pollRes.json();

    // Handle Veo callback-style response nested in polling
    const code = pollData.code ?? pollData.status;
    const info = pollData.data?.info || pollData.info;

    if (code === 200 || code === 'completed' || code === 'success') {
      // Veo returns resultUrls as a JSON-encoded string array
      if (info?.resultUrls) {
        try {
          const urls = typeof info.resultUrls === 'string'
            ? JSON.parse(info.resultUrls)
            : info.resultUrls;
          if (Array.isArray(urls) && urls.length > 0) return urls[0];
        } catch {
          // resultUrls might be a plain URL string
          return info.resultUrls;
        }
      }
      // Fallbacks for unified API format
      const url = pollData.url || pollData.result?.url || pollData.output?.url
        || pollData.data?.url || pollData.data?.result?.url;
      if (url) return url;
      throw new Error('Task completed but no video URL found in response');
    }

    if (code === 400 || code === 422 || code === 500 || code === 501
        || code === 'failed' || code === 'error') {
      throw new Error(pollData.msg || pollData.error || 'Video generation failed');
    }

    // Still processing — continue polling
  }

  throw new Error('Video generation timed out. Check task status at https://kie.ai/logs');
}
