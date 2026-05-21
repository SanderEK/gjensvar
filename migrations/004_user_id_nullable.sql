-- Etter overgang til client_id som eierskap er user_id ikke lenger nødvendig på video-rader.
-- Gjør user_id nullable i alle video-tabeller slik at upsert med kun client_id fungerer.

ALTER TABLE tiktok_videos ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE youtube_videos ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE facebook_videos ALTER COLUMN user_id DROP NOT NULL;

-- instagram_videos hadde aldri NOT NULL, men vi gjør det eksplisitt om kolonnen finnes.
DO $$ BEGIN
  ALTER TABLE instagram_videos ALTER COLUMN user_id DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE snapchat_videos ALTER COLUMN user_id DROP NOT NULL;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

-- Samme for unified_videos hvis user_id er NOT NULL der.
DO $$ BEGIN
  ALTER TABLE unified_videos ALTER COLUMN user_id DROP NOT NULL;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

-- Og video_categories.
DO $$ BEGIN
  ALTER TABLE video_categories ALTER COLUMN user_id DROP NOT NULL;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

-- Og follower_snapshots.
DO $$ BEGIN
  ALTER TABLE follower_snapshots ALTER COLUMN user_id DROP NOT NULL;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;
