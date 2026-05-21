// ---------- Clients ----------

export interface Client {
  id: string;
  name: string;
  created_by: string | null;
  created_at: string;
}

export interface ClientMember {
  id: string;
  client_id: string;
  user_id: string;
  role: string;
  created_at: string;
}

// ---------- Instagram ----------

export interface InstagramVideo {
  id: string;
  instagram_media_id: string;
  client_id: string | null;
  permalink: string | null;
  caption: string | null;
  posted_at: string | null;
  view_count: number;
  like_count: number;
  created_at: string;
}

export interface InstagramVideoDailyView {
  id: string;
  video_id: string;
  date: string; // YYYY-MM-DD
  views: number;
  created_at: string;
}

export interface InstagramVideoViewsSummary {
  id: string;
  instagram_media_id: string;
  permalink: string | null;
  caption: string | null;
  posted_at: string | null;
  total_views: number;
}

// ---------- TikTok ----------

export interface TikTokVideo {
  id: string;
  tiktok_video_id: string;
  client_id: string | null;
  permalink: string | null;
  caption: string | null;
  posted_at: string | null;
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  created_at: string;
}

export interface ConnectedAccount {
  id: string;
  user_id: string;
  client_id: string | null;
  platform: string;
  platform_username: string | null;
  platform_account_id: string | null;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

// ---------- YouTube ----------

export interface YouTubeVideo {
  id: string;
  youtube_video_id: string;
  client_id: string | null;
  permalink: string | null;
  title: string | null;
  published_at: string | null;
  view_count: number;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

// ---------- Snapchat ----------

export interface SnapchatVideo {
  id: string;
  snapchat_video_id: string;
  client_id: string | null;
  permalink: string | null;
  caption: string | null;
  posted_at: string | null;
  view_count: number;
  screenshot_count: number;
  share_count: number;
  created_at: string;
}

// ---------- Facebook ----------

export interface FacebookVideo {
  id: string;
  facebook_video_id: string;
  client_id: string | null;
  permalink: string | null;
  title: string | null;
  posted_at: string | null;
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  created_at: string;
  updated_at: string;
}

// ---------- Unified (sammenslått på tvers av plattformer) ----------

export interface PlatformEntry {
  views: number;
  likes: number;
  permalink: string | null;
  /** Plattformens egen video-ID (instagram_media_id, tiktok_video_id osv.). Brukes til override-handlinger. */
  platformVideoId: string;
  /**
   * Hvis satt: posten har en manuell virtuell dato som overstyrer
   * publiseringsdatoen ved gruppering. Inneholder den opprinnelige datoen
   * (YYYY-MM-DD) for å vise i tooltip.
   */
  overriddenFromDate: string | null;
}

export interface UnifiedVideoRow {
  date: string; // YYYY-MM-DD (brukes til gruppering og sortering)
  month: string; // Visningsnavn, f.eks. "Januar"
  title: string; // Caption/tittel (custom hvis satt, ellers caption fra plattform)
  customTitle: string | null; // Custom tittel satt av bruker
  categoryId: string | null; // UUID til valgt kategori 1
  categoryName: string | null; // Kategorinavn for visning
  categoryColor: string | null; // Fargekode for badge
  categoryId2: string | null; // UUID til valgt kategori 2
  categoryName2: string | null;
  categoryColor2: string | null;
  tiktok: PlatformEntry | null;
  youtube: PlatformEntry | null;
  instagram: PlatformEntry | null;
  snapchat: PlatformEntry | null;
  facebook: PlatformEntry | null;
  total: number;
  totalLikes: number;
}

// ---------- Video Categories ----------

export interface VideoCategory {
  id: string;
  name: string;
  color: string;
}

// ---------- Follower Snapshots ----------

export interface FollowerSnapshot {
  id: string;
  client_id: string | null;
  platform: string;
  follower_count: number;
  recorded_at: string;
}

