// Hjelpefunksjoner for å hente data fra Instagram Graph API.
// Vi bruker Facebook Graph API (graph.facebook.com), ikke graph.instagram.com,
// fordi Gjensvar kobler til IG Business Accounts via Facebook Pages.
// graph.instagram.com er kun for direkte Instagram Login (uten Facebook).

const INSTAGRAM_GRAPH_API_URL = "https://graph.facebook.com/v21.0";

interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: string;
  media_url?: string;
  permalink?: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
  plays?: number; // for VIDEO
  ig_reels_aggregated_all_plays_count?: number; // for REELS
}

interface InstagramInsights {
  impressions?: number;
  reach?: number;
}

/**
 * Henter alle media (posts/reels) fra Instagram-kontoen
 */
export async function fetchInstagramMedia(
  accessToken: string,
  accountId: string
): Promise<InstagramMedia[]> {
  const url = `${INSTAGRAM_GRAPH_API_URL}/${accountId}/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&limit=100`;

  const response = await fetch(`${url}&access_token=${accessToken}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      "[Instagram] fetchInstagramMedia feilet:",
      response.status,
      errorText
    );
    throw new Error(
      `Feil ved henting av Instagram media (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();
  return data.data || [];
}

/**
 * Henter insights (visninger) for en spesifikk media
 */
export async function fetchMediaInsights(
  accessToken: string,
  mediaId: string,
  mediaType: string
): Promise<InstagramInsights> {
  // Fra v22.0+ har Meta introdusert 'views' som erstatning for plays/impressions
  // views = totalt antall visninger for FEED, STORY, og REELS
  const metric = "views";
  const url = `${INSTAGRAM_GRAPH_API_URL}/${mediaId}/insights?metric=${metric}`;

  const response = await fetch(`${url}&access_token=${accessToken}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.warn(
      `Kunne ikke hente insights for ${mediaId}:`,
      errorData.error?.message || response.statusText
    );
    // Fallback til reach hvis views ikke er tilgjengelig
    return await fetchReachAsFallback(accessToken, mediaId);
  }

  const data = await response.json();

  const value =
    data.data?.find((d: any) => d.name === "views")?.values[0]?.value || 0;

  return { impressions: value, reach: value };
}

async function fetchReachAsFallback(
  accessToken: string,
  mediaId: string
): Promise<InstagramInsights> {
  const url = `${INSTAGRAM_GRAPH_API_URL}/${mediaId}/insights?metric=reach`;
  const response = await fetch(`${url}&access_token=${accessToken}`);
  
  if (response.ok) {
    const data = await response.json();
    const reach = data.data?.find((d: any) => d.name === "reach")?.values[0]?.value || 0;
    return { impressions: reach, reach };
  }
  
  return { impressions: 0, reach: 0 };
}
