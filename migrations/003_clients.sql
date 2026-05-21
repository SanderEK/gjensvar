-- Multi-klient system: kunder som Serotonic administrerer

-- Kunder-tabell
CREATE TABLE IF NOT EXISTS clients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Kobling mellom brukere og kunder
CREATE TABLE IF NOT EXISTS client_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  UNIQUE (client_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_client_members_user_id ON client_members (user_id);
CREATE INDEX IF NOT EXISTS idx_client_members_client_id ON client_members (client_id);

-- Legg til client_id i connected_accounts
ALTER TABLE connected_accounts ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES clients(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_connected_accounts_client_id ON connected_accounts (client_id);

-- Fjern gammel unique constraint og legg til ny
ALTER TABLE connected_accounts DROP CONSTRAINT IF EXISTS connected_accounts_user_id_platform_key;
ALTER TABLE connected_accounts ADD CONSTRAINT connected_accounts_client_id_platform_key UNIQUE (client_id, platform);

-- Legg til client_id i alle video-tabeller
ALTER TABLE instagram_videos ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES clients(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_instagram_videos_client_id ON instagram_videos (client_id);

ALTER TABLE tiktok_videos ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES clients(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_tiktok_videos_client_id ON tiktok_videos (client_id);

ALTER TABLE youtube_videos ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES clients(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_youtube_videos_client_id ON youtube_videos (client_id);

ALTER TABLE facebook_videos ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES clients(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_facebook_videos_client_id ON facebook_videos (client_id);

-- Snapchat (kan mangle, prøv med IF EXISTS)
DO $$ BEGIN
  ALTER TABLE snapchat_videos ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES clients(id) ON DELETE CASCADE;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Legg til client_id i unified_videos
DO $$ BEGIN
  ALTER TABLE unified_videos ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES clients(id) ON DELETE CASCADE;
  -- Fjern gammel unique constraint og legg til ny
  ALTER TABLE unified_videos DROP CONSTRAINT IF EXISTS unified_videos_user_id_date_key;
  ALTER TABLE unified_videos ADD CONSTRAINT unified_videos_client_id_date_key UNIQUE (client_id, date);
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Legg til client_id i video_categories
DO $$ BEGIN
  ALTER TABLE video_categories ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES clients(id) ON DELETE CASCADE;
  CREATE INDEX IF NOT EXISTS idx_video_categories_client_id ON video_categories (client_id);
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Legg til client_id i follower_snapshots
DO $$ BEGIN
  ALTER TABLE follower_snapshots ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES clients(id) ON DELETE CASCADE;
  CREATE INDEX IF NOT EXISTS idx_follower_snapshots_client_id ON follower_snapshots (client_id);
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;
