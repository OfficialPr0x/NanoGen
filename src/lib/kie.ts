export type AspectRatio = "9:16" | "16:9" | "Auto";
export type VideoResolution = "720p" | "1080p";

export type VeoModel = 'veo3' | 'veo3_fast' | 'veo3_lite';
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
export type GenerationType = 'TEXT_2_VIDEO' | 'FIRST_AND_LAST_FRAMES_2_VIDEO' | 'REFERENCE_2_VIDEO';

export type ProgressCallback = (status: TaskProgress) => void;
export interface TaskProgress {
  stage: 'submitting' | 'queued' | 'processing' | 'completed' | 'failed';
  message: string;
  attempt?: number;
  maxAttempts?: number;
  taskId?: string;
  elapsed?: number;
}

export interface KieVideoParams {
  prompt: string;
  aspectRatio: AspectRatio;
  resolution: VideoResolution;
  model: VideoModel;
  apiKey: string;
  imageUrls?: string[];
  generationType?: GenerationType;
  onProgress?: ProgressCallback;
}

const VEO_MODELS = new Set<string>(['veo3', 'veo3_fast', 'veo3_lite']);
const MAX_POLL_ATTEMPTS = 120;
const POLL_INTERVAL_MS = 5000;

// --- Shared helpers ---

function extractTaskId(result: Record<string, unknown>): string | null {
  // Walk through all known nesting patterns
  const data = result.data as Record<string, unknown> | undefined;
  return (data?.taskId ?? data?.task_id ?? data?.id
    ?? result.task_id ?? result.taskId ?? result.id ?? null) as string | null;
}

function extractMediaUrl(pollData: Record<string, unknown>): string | null {
  const data = pollData.data as Record<string, unknown> | undefined;
  const info = (data?.info || pollData.info) as Record<string, unknown> | undefined;

  if (info?.resultUrls) {
    try {
      const raw = info.resultUrls;
      const urls = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (Array.isArray(urls) && urls.length > 0) return urls[0];
    } catch {
      if (typeof info.resultUrls === 'string') return info.resultUrls;
    }
  }

  // Try common URL field names
  for (const obj of [info, data, pollData]) {
    if (!obj || typeof obj !== 'object') continue;
    for (const key of ['url', 'videoUrl', 'video_url', 'imageUrl', 'image_url']) {
      if (typeof (obj as Record<string, unknown>)[key] === 'string') {
        return (obj as Record<string, unknown>)[key] as string;
      }
    }
  }

  // Nested result objects
  const nested = (data?.result || pollData.result || pollData.output) as Record<string, unknown> | undefined;
  if (nested?.url && typeof nested.url === 'string') return nested.url;

  return null;
}

function isTerminalSuccess(pollData: Record<string, unknown>): boolean {
  const code = pollData.code;
  const data = pollData.data as Record<string, unknown> | undefined;
  const status = data?.status || pollData.status;
  return code === 200
    || status === 'completed'
    || status === 'success'
    || status === 'done';
}

function isTerminalFailure(pollData: Record<string, unknown>): boolean {
  const code = pollData.code;
  const data = pollData.data as Record<string, unknown> | undefined;
  const status = data?.status || pollData.status;
  return code === 400 || code === 422 || code === 500 || code === 501
    || status === 'failed' || status === 'error';
}

function getErrorMessage(pollData: Record<string, unknown>): string {
  const data = pollData.data as Record<string, unknown> | undefined;
  return (pollData.msg || data?.msg || pollData.error || 'Generation failed') as string;
}

async function handleApiError(result: Record<string, unknown>, httpStatus: number): Promise<never> {
  const code = result.code as number | undefined;
  if (code && code !== 200) {
    const messages: Record<number, string> = {
      402: 'Insufficient credits. Top up at https://kie.ai/pricing',
      422: (result.msg as string) || 'Request validation failed',
      429: 'Rate limited. Please wait and try again.',
      455: 'KIE service is under maintenance. Try again later.',
      501: 'Generation failed on server side',
      505: 'This feature is currently disabled',
    };
    throw new Error(messages[code] || (result.msg as string) || `KIE error code ${code}`);
  }
  throw new Error((result.msg as string) || `KIE API HTTP ${httpStatus}`);
}

async function pollForResult(
  taskId: string,
  apiKey: string,
  maxAttempts: number,
  intervalMs: number,
  onProgress?: ProgressCallback,
): Promise<string> {
  const startTime = Date.now();

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, intervalMs));

    const elapsed = Math.round((Date.now() - startTime) / 1000);
    onProgress?.({
      stage: 'processing',
      message: `Checking status... (${elapsed}s elapsed)`,
      attempt,
      maxAttempts,
      taskId,
      elapsed,
    });

    let pollRes: Response;
    try {
      pollRes = await fetch(`/api/kie/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
    } catch {
      // Network error — retry
      onProgress?.({ stage: 'processing', message: `Network hiccup, retrying... (${elapsed}s)`, attempt, maxAttempts, taskId, elapsed });
      continue;
    }

    if (pollRes.status === 429) {
      onProgress?.({ stage: 'processing', message: `Rate limited, backing off... (${elapsed}s)`, attempt, maxAttempts, taskId, elapsed });
      await new Promise(resolve => setTimeout(resolve, intervalMs * 2));
      continue;
    }

    if (!pollRes.ok) {
      onProgress?.({ stage: 'processing', message: `Server returned ${pollRes.status}, retrying... (${elapsed}s)`, attempt, maxAttempts, taskId, elapsed });
      continue;
    }

    let pollData: Record<string, unknown>;
    try {
      pollData = await pollRes.json();
    } catch {
      continue; // Malformed JSON, retry
    }

    // API returns null data while task is queued
    if (!pollData || pollData.data === null || pollData.data === undefined) {
      onProgress?.({ stage: 'queued', message: `Task queued, waiting... (${elapsed}s)`, attempt, maxAttempts, taskId, elapsed });
      continue;
    }

    if (isTerminalSuccess(pollData)) {
      const url = extractMediaUrl(pollData);
      if (url) {
        onProgress?.({ stage: 'completed', message: 'Generation complete!', taskId, elapsed });
        return url;
      }
      // Success code but no URL yet — keep polling
      onProgress?.({ stage: 'processing', message: `Finalizing... (${elapsed}s)`, attempt, maxAttempts, taskId, elapsed });
      continue;
    }

    if (isTerminalFailure(pollData)) {
      const msg = getErrorMessage(pollData);
      onProgress?.({ stage: 'failed', message: msg, taskId, elapsed });
      throw new Error(msg);
    }

    // Still processing
    onProgress?.({ stage: 'processing', message: `Generating... (${elapsed}s)`, attempt, maxAttempts, taskId, elapsed });
  }

  throw new Error('Generation timed out. Check task status at https://kie.ai/logs');
}

// --- Video Generation ---

export async function generateKieVideo({ prompt, aspectRatio, resolution, model, apiKey, imageUrls, generationType, onProgress }: KieVideoParams) {
  const isVeo = VEO_MODELS.has(model);

  onProgress?.({ stage: 'submitting', message: `Submitting ${isVeo ? 'Veo' : model} task...` });

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

  if (response.status === 429) throw new Error('Rate limit exceeded. Please wait and try again.');
  if (response.status === 401) throw new Error('Authentication failed. Check your KIE API key in Settings.');

  const result = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if ((result.code && result.code !== 200) || !response.ok) {
    await handleApiError(result, response.status);
  }

  const taskId = extractTaskId(result);
  if (!taskId) {
    throw new Error(`No taskId in KIE response: ${JSON.stringify(result).slice(0, 500)}`);
  }

  onProgress?.({ stage: 'queued', message: 'Task created, waiting for processing...', taskId });

  return pollForResult(taskId, apiKey, MAX_POLL_ATTEMPTS, POLL_INTERVAL_MS, onProgress);
}

// --- Image Generation ---

export type ImageModel =
  | 'gemini'
  | 'seedream'
  | 'z-image'
  | 'google-imagen'
  | 'flux2'
  | 'grok-imagine'
  | 'gpt-image'
  | 'topaz'
  | 'recraft'
  | 'ideogram'
  | 'qwen'
  | '4o-image'
  | 'flux-kontext'
  | 'wan-image';

export type ImageAspectRatio = '1:1' | '9:16' | '16:9';

export interface KieImageParams {
  prompt: string;
  aspectRatio: ImageAspectRatio;
  model: ImageModel;
  apiKey: string;
  imageUrls?: string[];
  onProgress?: ProgressCallback;
}

const IMAGE_POLL_INTERVAL_MS = 3000;
const IMAGE_MAX_POLL_ATTEMPTS = 100;

export async function generateKieImage({ prompt, aspectRatio, model, apiKey, imageUrls, onProgress }: KieImageParams) {
  onProgress?.({ stage: 'submitting', message: `Submitting ${model} task...` });

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
      ...(imageUrls?.length ? { imageUrls } : {}),
    })
  });

  if (response.status === 429) throw new Error('Rate limit exceeded. Please wait and try again.');
  if (response.status === 401) throw new Error('Authentication failed. Check your KIE API key in Settings.');

  const result = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if ((result.code && result.code !== 200) || !response.ok) {
    await handleApiError(result, response.status);
  }

  const taskId = extractTaskId(result);
  if (!taskId) {
    throw new Error(`No taskId in KIE response: ${JSON.stringify(result).slice(0, 500)}`);
  }

  onProgress?.({ stage: 'queued', message: 'Task created, waiting for processing...', taskId });

  return pollForResult(taskId, apiKey, IMAGE_MAX_POLL_ATTEMPTS, IMAGE_POLL_INTERVAL_MS, onProgress);
}
