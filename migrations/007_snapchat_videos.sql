-- Snapchat tilbyr ingen offisiell API for analytics-tall, så data må legges
-- inn manuelt. Strukturen speiler de andre plattform-tabellene slik at
-- buildUnifiedRows kan plukke opp postene uten ekstra logikk.

CREATE TABLE IF NOT EXISTS snapchat_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  snapchat_video_id text NOT NULL,
  permalink text,
  caption text,
  posted_at timestamptz,
  view_count integer NOT NULL DEFAULT 0,
  screenshot_count integer NOT NULL DEFAULT 0,
  share_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Sikre at eksisterende installasjoner får riktige kolonner.
ALTER TABLE snapchat_videos
  ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES clients(id) ON DELETE CASCADE;
ALTER TABLE snapchat_videos
  ADD COLUMN IF NOT EXISTS permalink text;
ALTER TABLE snapchat_videos
  ADD COLUMN IF NOT EXISTS caption text;
ALTER TABLE snapchat_videos
  ADD COLUMN IF NOT EXISTS posted_at timestamptz;
ALTER TABLE snapchat_videos
  ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;
ALTER TABLE snapchat_videos
  ADD COLUMN IF NOT EXISTS screenshot_count integer NOT NULL DEFAULT 0;
ALTER TABLE snapchat_videos
  ADD COLUMN IF NOT EXISTS share_count integer NOT NULL DEFAULT 0;
ALTER TABLE snapchat_videos
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Eldre installasjoner kan ha en NOT NULL `user_id`-kolonne. Vi gikk over til
-- multi-klient (client_id) så user_id er ikke lenger relevant. Drop NOT NULL
-- så vi kan sette inn rader uten å oppgi user_id.
DO $$ BEGIN
  ALTER TABLE snapchat_videos ALTER COLUMN user_id DROP NOT NULL;
  EXCEPTION WHEN undefined_column THEN NULL;
END $$;

-- Unik per kunde + manuell video-id (brukes også av hidden_videos / overrides).
CREATE UNIQUE INDEX IF NOT EXISTS snapchat_videos_client_video_id_key
  ON snapchat_videos (client_id, snapchat_video_id);

CREATE INDEX IF NOT EXISTS idx_snapchat_videos_client_id
  ON snapchat_videos (client_id);

CREATE INDEX IF NOT EXISTS idx_snapchat_videos_posted_at
  ON snapchat_videos (client_id, posted_at);
