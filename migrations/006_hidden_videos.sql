-- Soft-skjuling av plattform-poster fra dashboard-oversikten.
-- Brukes når kunder har postet eget innhold som ikke skal regnes med.
-- Posten blir IKKE slettet fra plattform-tabellene (instagram_videos osv.)
-- så historikken bevares. Den filtreres bare ut i buildUnifiedRows.

CREATE TABLE IF NOT EXISTS hidden_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  platform text NOT NULL,
  platform_video_id text NOT NULL,
  hidden_at timestamptz DEFAULT now(),
  CONSTRAINT hidden_videos_unique
    UNIQUE (client_id, platform, platform_video_id)
);

CREATE INDEX IF NOT EXISTS idx_hidden_videos_client_id
  ON hidden_videos (client_id);
