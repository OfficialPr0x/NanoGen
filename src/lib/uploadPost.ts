export interface UploadPostParams {
  apiKey: string;
  caption: string;
  platforms: string[];
  mediaUrls?: string[];
  scheduledAt?: string;
}

export async function createPost({ apiKey, caption, platforms, mediaUrls, scheduledAt }: UploadPostParams) {
  const response = await fetch('/api/upload-post/v1/posts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      caption,
      platforms,
      media_urls: mediaUrls,
      scheduled_at: scheduledAt
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Upload-Post API error: ${response.status}`);
  }

  return await response.json();
}

export async function testUploadPostConnection(apiKey: string) {
  // Using a more robust endpoint to test connection
  const response = await fetch('/api/upload-post/v1/posts?limit=1', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Connection failed with status ${response.status}`);
  }

  return await response.json();
}
