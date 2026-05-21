-- Manuell overstyring av publiseringsdato for plattform-poster.
-- Brukes når samme innhold er postet rundt midnatt og automatisk ender på
-- forskjellige datoer på tvers av plattformer.
--
-- Den faktiske dataen i instagram_videos / tiktok_videos / etc. røres ikke;
-- buildUnifiedRows leser denne tabellen og bruker virtual_date i stedet for
-- posted_at/published_at ved gruppering.

CREATE TABLE IF NOT EXISTS manual_video_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  platform text NOT NULL,
  platform_video_id text NOT NULL,
  virtual_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT manual_video_overrides_unique
    UNIQUE (client_id, platform, platform_video_id)
);

CREATE INDEX IF NOT EXISTS idx_manual_video_overrides_client_id
  ON manual_video_overrides (client_id);

CREATE INDEX IF NOT EXISTS idx_manual_video_overrides_virtual_date
  ON manual_video_overrides (client_id, virtual_date);
