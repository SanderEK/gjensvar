-- ============================================================================
--  Gjensvar — Clear demo client data
-- ============================================================================
--
--  Tømmer alt innhold for én bestemt demo-kunde slik at du kan starte et
--  videoopptak med et tomt dashbord. Sletter kun rader som ble lagt inn av
--  demo-synken (alle ID-er starter med "demo-"), og rydder også opp i
--  tilhørende kategorier, skjulinger og overrides.
--
--  Slik bruker du det:
--    1) Finn klient-ID-en for demo-kunden i Supabase:
--          SELECT id, name FROM clients;
--    2) Bytt ut «PASTE-DEMO-CLIENT-ID-HERE» under (3 steder) med UUID-en.
--    3) Kjør hele blokka i Supabase SQL editor.
--
-- ============================================================================

-- ---------------------------------------------------------------------------
--  Steg 1: Slett alle demo-videoer på tvers av plattformer
-- ---------------------------------------------------------------------------
DELETE FROM tiktok_videos
  WHERE client_id = 'PASTE-DEMO-CLIENT-ID-HERE'::uuid
    AND tiktok_video_id LIKE 'demo-%';

DELETE FROM youtube_videos
  WHERE client_id = 'PASTE-DEMO-CLIENT-ID-HERE'::uuid
    AND youtube_video_id LIKE 'demo-%';

DELETE FROM instagram_videos
  WHERE client_id = 'PASTE-DEMO-CLIENT-ID-HERE'::uuid
    AND instagram_media_id LIKE 'demo-%';

DELETE FROM facebook_videos
  WHERE client_id = 'PASTE-DEMO-CLIENT-ID-HERE'::uuid
    AND facebook_video_id LIKE 'demo-%';

DELETE FROM snapchat_videos
  WHERE client_id = 'PASTE-DEMO-CLIENT-ID-HERE'::uuid
    AND snapchat_video_id LIKE 'demo-%';

-- ---------------------------------------------------------------------------
--  Steg 2: Rydd opp i tilhørende metadata
--  Disse tabellene refererer til platform_video_id og kan etterlate
--  "døde" rader hvis du allerede har klikket rundt i dashbordet før reset.
-- ---------------------------------------------------------------------------
DELETE FROM hidden_videos
  WHERE client_id = 'PASTE-DEMO-CLIENT-ID-HERE'::uuid;

DELETE FROM manual_video_overrides
  WHERE client_id = 'PASTE-DEMO-CLIENT-ID-HERE'::uuid;

-- video_categories og unified_videos er valgfritt — kommenter inn hvis du
-- også vil nullstille kategorier og evt. cachet aggregert tabell.
-- DELETE FROM video_categories
--   WHERE client_id = 'PASTE-DEMO-CLIENT-ID-HERE'::uuid;
--
-- DELETE FROM unified_videos
--   WHERE client_id = 'PASTE-DEMO-CLIENT-ID-HERE'::uuid;

-- ============================================================================
--  Ferdig. Refresh /dashboard – du skal nå se et tomt dashbord med
--  meldingen "Ingen videoer ennå".
-- ============================================================================
