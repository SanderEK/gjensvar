const TIKTOK_API_URL = "https://open.tiktokapis.com/v2";

export interface TikTokVideoItem {
  id: string;
  title: string;
  share_url: string;
  create_time: number; // Unix timestamp
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
}

export type TikTokFetchProgress = (event: { current: number }) => void;

interface TikTokVideoListResponse {
  data: {
    videos: TikTokVideoItem[];
    cursor: number;
    has_more: boolean;
  };
  error: {
    code: string;
    message: string;
  };
}

/**
 * Hent alle videoer fra en TikTok-konto.
 * Bruker paginering for å hente alle.
 */
export async function fetchTikTokVideos(
  accessToken: string,
  onProgress?: TikTokFetchProgress
): Promise<TikTokVideoItem[]> {
  const allVideos: TikTokVideoItem[] = [];
  let cursor: number | undefined = undefined;
  let hasMore = true;

  while (hasMore) {
    const body: Record<string, unknown> = {
      max_count: 20,
    };
    if (cursor !== undefined) {
      body.cursor = cursor;
    }

    const response = await fetch(
      `${TIKTOK_API_URL}/video/list/?fields=id,title,share_url,create_time,view_count,like_count,comment_count,share_count`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("TikTok video list feil:", response.status, errorText);
      throw new Error(`TikTok API feil: ${response.status}`);
    }

    const result: TikTokVideoListResponse = await response.json();

    if (result.error && result.error.code !== "ok") {
      console.error("TikTok API error:", result.error);
      throw new Error(`TikTok API: ${result.error.message}`);
    }

    if (result.data?.videos) {
      allVideos.push(...result.data.videos);
      onProgress?.({ current: allVideos.length });
    }

    hasMore = result.data?.has_more ?? false;
    cursor = result.data?.cursor;
  }

  return allVideos;
}
