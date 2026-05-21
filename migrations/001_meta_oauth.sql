-- Migration: Meta OAuth support for Instagram and Facebook
-- Run this in Supabase SQL editor

-- 1. Add platform_account_id to connected_accounts (stores IG Business Account ID / FB Page ID)
ALTER TABLE connected_accounts
  ADD COLUMN IF NOT EXISTS platform_account_id text;

-- 2. Add user_id to instagram_videos (for per-user data)
ALTER TABLE instagram_videos
  ADD COLUMN IF NOT EXISTS user_id uuid;

-- 3. Add like_count to instagram_videos if not already present
ALTER TABLE instagram_videos
  ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 0;

-- 4. Ensure facebook_videos table exists with correct schema
CREATE TABLE IF NOT EXISTS facebook_videos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  facebook_video_id text UNIQUE NOT NULL,
  user_id uuid,
  permalink text,
  title text,
  posted_at timestamptz,
  view_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  share_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Create index on facebook_videos for faster lookups
CREATE INDEX IF NOT EXISTS idx_facebook_videos_user_id ON facebook_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_facebook_videos_posted_at ON facebook_videos(posted_at DESC);

-- 6. Create index on instagram_videos user_id
CREATE INDEX IF NOT EXISTS idx_instagram_videos_user_id ON instagram_videos(user_id);
