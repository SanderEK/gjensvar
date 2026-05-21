const FB_GRAPH_API = "https://graph.facebook.com/v21.0";

export interface FacebookVideoItem {
  id: string;
  title?: string;
  description?: string;
  permalink_url?: string;
  created_time: string;
  length?: number;
  views?: number;
  likes?: number;
}

export type FacebookFetchProgress = (event: {
  current: number;
  total: number | null;
}) => void;

interface FBVideoNode {
  id: string;
  title?: string;
  description?: string;
  permalink_url?: string;
  created_time: string;
  length?: number;
}

interface FBVideoInsight {
  name: string;
  values: { value: number }[];
}

/**
 * Henter alle videoer fra en Facebook Page med visninger og likes.
 */
export async function fetchFacebookPageVideos(
  pageAccessToken: string,
  pageId: string,
  onProgress?: FacebookFetchProgress
): Promise<FacebookVideoItem[]> {
  const allVideos: FacebookVideoItem[] = [];
  let url: string | null =
    `${FB_GRAPH_API}/${pageId}/videos?fields=id,title,description,permalink_url,created_time,length&limit=100&access_token=${pageAccessToken}`;
  let knownTotal: number | null = null;

  while (url) {
    const res: Response = await fetch(url);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Facebook video list feil:", res.status, errorText);
      throw new Error(`Facebook API feil: ${res.status}`);
    }

    const data: {
      data?: FBVideoNode[];
      paging?: { next?: string };
      error?: { message: string };
    } = await res.json();

    if (data.error) {
      throw new Error(`Facebook API: ${data.error.message}`);
    }

    const videos: FBVideoNode[] = data.data || [];

    // Når vi vet om det kommer en neste side, kan totalet bli større.
    // Vi rapporterer "minst så mange vi har sett så langt" ved å sende null
    // som total inntil vi kjenner det helt på siste side.
    const hasNext = !!data.paging?.next;

    for (const video of videos) {
      const stats = await fetchVideoStats(pageAccessToken, video.id);

      allVideos.push({
        id: video.id,
        title: video.title,
        description: video.description,
        permalink_url: video.permalink_url,
        created_time: video.created_time,
        length: video.length,
        views: stats.views,
        likes: stats.likes,
      });

      onProgress?.({ current: allVideos.length, total: knownTotal });
    }

    if (!hasNext) {
      knownTotal = allVideos.length;
      onProgress?.({ current: allVideos.length, total: knownTotal });
    }

    url = data.paging?.next || null;
  }

  return allVideos;
}

async function fetchVideoStats(
  pageAccessToken: string,
  videoId: string
): Promise<{ views: number; likes: number }> {
  let views = 0;
  let likes = 0;

  // Fetch video insights for views
  try {
    const insightsRes = await fetch(
      `${FB_GRAPH_API}/${videoId}/video_insights?metric=total_video_views&access_token=${pageAccessToken}`
    );

    if (insightsRes.ok) {
      const insightsData = await insightsRes.json();
      const viewInsight = (insightsData.data as FBVideoInsight[] | undefined)?.find(
        (i) => i.name === "total_video_views"
      );
      views = viewInsight?.values?.[0]?.value || 0;
    }
  } catch (err) {
    console.warn(`Kunne ikke hente insights for video ${videoId}:`, err);
  }

  // Fetch likes count
  try {
    const likesRes = await fetch(
      `${FB_GRAPH_API}/${videoId}?fields=likes.summary(true)&access_token=${pageAccessToken}`
    );

    if (likesRes.ok) {
      const likesData = await likesRes.json();
      likes = likesData.likes?.summary?.total_count || 0;
    }
  } catch (err) {
    console.warn(`Kunne ikke hente likes for video ${videoId}:`, err);
  }

  return { views, likes };
}
