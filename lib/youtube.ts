const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3";

export interface YouTubeVideoItem {
  id: string;
  snippet: {
    title: string;
    publishedAt: string;
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
  status: {
    privacyStatus: "public" | "unlisted" | "private";
  };
  contentDetails: {
    duration: string;
  };
  durationSeconds: number;
  isShort: boolean;
}

export type YouTubeFetchPhase =
  | { phase: "channel" }
  | { phase: "ids"; current: number }
  | { phase: "details"; current: number; total: number };

export type YouTubeFetchProgress = (event: YouTubeFetchPhase) => void;

interface YouTubeChannelResponse {
  items: Array<{
    contentDetails: {
      relatedPlaylists: {
        uploads: string; // Playlist ID for uploaded videos
      };
    };
  }>;
}

interface YouTubePlaylistItemsResponse {
  items: Array<{
    contentDetails: {
      videoId: string;
    };
  }>;
  nextPageToken?: string;
}

interface YouTubeSearchResponse {
  items: Array<{
    id: {
      kind: string;
      videoId?: string;
    };
  }>;
  nextPageToken?: string;
}

interface YouTubeVideosResponse {
  items: Array<Omit<YouTubeVideoItem, "durationSeconds" | "isShort">>;
}

/**
 * Parse YouTube ISO 8601 duration (e.g. "PT1M30S", "PT45S", "PT2H10M5S") til sekunder.
 */
function parseISO8601Duration(duration: string): number {
  const match = duration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseFloat(match[3] || "0");
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Hent brukerens YouTube-kanal for å finne uploads playlist ID
 */
async function getUploadsPlaylistId(accessToken: string): Promise<string> {
  const response = await fetch(
    `${YOUTUBE_API_URL}/channels?part=contentDetails&mine=true`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("YouTube channel fetch error:", response.status, errorText);
    throw new Error(`YouTube API feil: ${response.status}`);
  }

  const data: YouTubeChannelResponse = await response.json();
  
  if (!data.items || data.items.length === 0) {
    throw new Error("Ingen YouTube-kanal funnet");
  }

  return data.items[0].contentDetails.relatedPlaylists.uploads;
}

/**
 * Hent alle video-IDer fra uploads playlist
 */
async function getVideoIdsFromUploads(
  accessToken: string,
  playlistId: string,
  onProgress?: YouTubeFetchProgress,
  startCount = 0
): Promise<string[]> {
  const videoIds: string[] = [];
  let pageToken: string | undefined = undefined;

  do {
    const url = new URL(`${YOUTUBE_API_URL}/playlistItems`);
    url.searchParams.set("part", "contentDetails");
    url.searchParams.set("playlistId", playlistId);
    url.searchParams.set("maxResults", "50");
    if (pageToken) {
      url.searchParams.set("pageToken", pageToken);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("YouTube playlist items error:", response.status, errorText);
      throw new Error(`YouTube API feil: ${response.status}`);
    }

    const data: YouTubePlaylistItemsResponse = await response.json();

    for (const item of data.items) {
      videoIds.push(item.contentDetails.videoId);
    }

    onProgress?.({ phase: "ids", current: startCount + videoIds.length });

    pageToken = data.nextPageToken;
  } while (pageToken);

  return videoIds;
}

/**
 * Hent alle video-IDer via search.list med forMine=true. Dette er mer pålitelig
 * for shorts, som av og til mangler fra uploads-playlisten.
 */
async function getVideoIdsFromSearch(
  accessToken: string,
  onProgress?: YouTubeFetchProgress,
  startCount = 0
): Promise<string[]> {
  const videoIds: string[] = [];
  let pageToken: string | undefined = undefined;

  do {
    const url = new URL(`${YOUTUBE_API_URL}/search`);
    url.searchParams.set("part", "id");
    url.searchParams.set("forMine", "true");
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "50");
    url.searchParams.set("order", "date");
    if (pageToken) {
      url.searchParams.set("pageToken", pageToken);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("YouTube search error:", response.status, errorText);
      throw new Error(`YouTube API feil: ${response.status}`);
    }

    const data: YouTubeSearchResponse = await response.json();

    for (const item of data.items) {
      if (item.id?.videoId) {
        videoIds.push(item.id.videoId);
      }
    }

    onProgress?.({ phase: "ids", current: startCount + videoIds.length });

    pageToken = data.nextPageToken;
  } while (pageToken);

  return videoIds;
}

/**
 * Hent detaljer for flere videoer (maks 50 per request)
 */
async function getVideoDetails(
  accessToken: string,
  videoIds: string[],
  onProgress?: YouTubeFetchProgress
): Promise<YouTubeVideoItem[]> {
  const allVideos: YouTubeVideoItem[] = [];

  // YouTube API støtter maks 50 video IDs per request
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);

    const url = new URL(`${YOUTUBE_API_URL}/videos`);
    url.searchParams.set("part", "snippet,statistics,status,contentDetails");
    url.searchParams.set("id", batch.join(","));

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("YouTube videos error:", response.status, errorText);
      throw new Error(`YouTube API feil: ${response.status}`);
    }

    const data: YouTubeVideosResponse = await response.json();

    const enrichedAll = data.items.map((v) => {
      const durationSeconds = parseISO8601Duration(
        v.contentDetails?.duration || "PT0S"
      );
      return {
        ...v,
        durationSeconds,
        isShort: durationSeconds > 0 && durationSeconds <= 60,
      } as YouTubeVideoItem;
    });

    const skippedNonPublic = enrichedAll.filter(
      (v) => v.status?.privacyStatus !== "public"
    ).length;
    const skippedLongForm = enrichedAll.filter(
      (v) => v.status?.privacyStatus === "public" && !v.isShort
    ).length;

    const shorts = enrichedAll.filter(
      (v) => v.status?.privacyStatus === "public" && v.isShort
    );

    console.log(
      `[YouTube] Batch: beholder ${shorts.length} shorts. Hopper over ${skippedLongForm} long-form og ${skippedNonPublic} ikke-offentlige.`
    );

    allVideos.push(...shorts);

    onProgress?.({
      phase: "details",
      current: allVideos.length,
      total: videoIds.length,
    });
  }

  return allVideos;
}

/**
 * Hovedfunksjon: Hent alle videoer fra brukerens YouTube-kanal.
 *
 * Vi kombinerer to kilder for maksimal dekning:
 *  1. Uploads-playlisten (vanlige videoer + de fleste shorts)
 *  2. search.list?forMine=true (sikrer at shorts ikke faller bort)
 *
 * Resultatene dedupliseres på video-ID.
 */
export async function fetchYouTubeVideos(
  accessToken: string,
  onProgress?: YouTubeFetchProgress
): Promise<YouTubeVideoItem[]> {
  onProgress?.({ phase: "channel" });
  const uploadsPlaylistId = await getUploadsPlaylistId(accessToken);

  const uploadsIds = await getVideoIdsFromUploads(
    accessToken,
    uploadsPlaylistId,
    onProgress,
    0
  );

  let searchIds: string[] = [];
  try {
    searchIds = await getVideoIdsFromSearch(
      accessToken,
      onProgress,
      uploadsIds.length
    );
  } catch (err) {
    console.error("YouTube search.list feilet, fortsetter med uploads:", err);
  }

  const allIds = Array.from(new Set([...uploadsIds, ...searchIds]));
  const onlyInSearch = searchIds.filter((id) => !uploadsIds.includes(id));

  console.log(
    `[YouTube] IDer funnet: uploads=${uploadsIds.length}, search=${searchIds.length}, kun i search=${onlyInSearch.length}, totalt unike=${allIds.length}`
  );

  if (allIds.length === 0) {
    return [];
  }

  const videos = await getVideoDetails(accessToken, allIds, onProgress);

  return videos;
}
