-- ============================================================================
--  Gjensvar — Dummy data seed
-- ============================================================================
--
--  Hva scriptet gjør:
--    Genererer ca. 150 dummy-videoer fordelt over de siste 365 dagene på
--    tvers av TikTok, YouTube, Instagram, Facebook og Snapchat. I tillegg
--    legges det inn follower-snapshots for analytics-fanen.
--
--  Slik bruker du det:
--    1) Finn klient-ID-en din i Supabase:
--          SELECT id, name FROM clients;
--    2) Bytt ut «PASTE-CLIENT-ID-HERE» under (3 steder) med din UUID.
--    3) Kjør hele blokka i Supabase SQL editor.
--
--  Slik fjerner du dummy-data igjen:
--    Alle ID-er starter med «dummy-». Kjør:
--      DELETE FROM tiktok_videos    WHERE tiktok_video_id    LIKE 'dummy-%';
--      DELETE FROM youtube_videos   WHERE youtube_video_id   LIKE 'dummy-%';
--      DELETE FROM instagram_videos WHERE instagram_media_id LIKE 'dummy-%';
--      DELETE FROM facebook_videos  WHERE facebook_video_id  LIKE 'dummy-%';
--      DELETE FROM snapchat_videos  WHERE snapchat_video_id  LIKE 'dummy-%';
--      DELETE FROM follower_snapshots
--        WHERE recorded_at >= NOW() - INTERVAL '400 days'
--          AND client_id = 'PASTE-CLIENT-ID-HERE';
--
-- ============================================================================

-- ---------------------------------------------------------------------------
--  TikTok — ca. 40 poster
-- ---------------------------------------------------------------------------
WITH params AS (
  SELECT '9916cb94-ef1b-46b9-9953-6508e659fa55'::uuid AS client_id
),
captions AS (
  SELECT ARRAY[
    'Slik gjør du det selv 🔥',
    'Bak kulissene fra forrige uke',
    'Vi prøvde noe nytt i dag',
    'Tre tips du burde kjenne til',
    'Da alt nesten gikk galt',
    'Møt teamet vårt',
    'Quick wins for hverdagen',
    'Rask tutorial: hvordan vi løste det',
    'Throwback til forrige måned',
    'Spørsmålet vi får oftest'
  ] AS arr
)
INSERT INTO tiktok_videos (
  client_id, tiktok_video_id, caption, posted_at,
  view_count, like_count, comment_count, share_count, permalink
)
SELECT
  p.client_id,
  'dummy-tiktok-' || md5(random()::text || gs::text),
  (SELECT arr[1 + (random() * 9)::int] FROM captions),
  NOW() - (random() * 365 || ' days')::interval
        - (random() * 86400 || ' seconds')::interval,
  (300 + (random() * 80000))::int,
  (10 + (random() * 4000))::int,
  (random() * 200)::int,
  (random() * 500)::int,
  'https://www.tiktok.com/@dummy/video/' || floor(random() * 1e16)::bigint::text
FROM params p, generate_series(1, 40) gs;

-- ---------------------------------------------------------------------------
--  YouTube (Shorts) — ca. 25 poster
-- ---------------------------------------------------------------------------
WITH params AS (
  SELECT '9916cb94-ef1b-46b9-9953-6508e659fa55'::uuid AS client_id
),
titles AS (
  SELECT ARRAY[
    'Hvordan vi økte rekkevidden med 200 %',
    'Mini-tutorial for begynnere',
    'En dag på kontoret',
    'Q&A: spørsmål fra følgerne',
    'Topp 5 verktøy vi bruker',
    'Test: ny strategi for innhold',
    'Behind the scenes',
    'Highlights fra forrige måned',
    'Gjør slik om du står fast',
    'Det vi lærte i 2025'
  ] AS arr
)
INSERT INTO youtube_videos (
  client_id, youtube_video_id, title, published_at,
  view_count, like_count, comment_count, permalink
)
SELECT
  p.client_id,
  'dummy-youtube-' || md5(random()::text || gs::text),
  (SELECT arr[1 + (random() * 9)::int] FROM titles),
  NOW() - (random() * 365 || ' days')::interval
        - (random() * 86400 || ' seconds')::interval,
  (500 + (random() * 25000))::int,
  (20 + (random() * 1500))::int,
  (random() * 80)::int,
  'https://www.youtube.com/shorts/' || substr(md5(random()::text), 1, 11)
FROM params p, generate_series(1, 25) gs;

-- ---------------------------------------------------------------------------
--  Instagram — ca. 35 poster
-- ---------------------------------------------------------------------------
WITH params AS (
  SELECT '9916cb94-ef1b-46b9-9953-6508e659fa55'::uuid AS client_id
),
captions AS (
  SELECT ARRAY[
    'Helgens beste øyeblikk ✨',
    'Ny lansering — ute nå!',
    'Glimt fra studio',
    'Takk for fantastiske tilbakemeldinger',
    'Del din opplevelse i kommentarfeltet',
    'En liten reminder for mandagen',
    'Slik bruker du den nye funksjonen',
    'Throwback Thursday',
    'Lørdagens favoritt',
    'Inspirasjon til uka som kommer'
  ] AS arr
)
INSERT INTO instagram_videos (
  client_id, instagram_media_id, caption, posted_at,
  view_count, like_count, permalink
)
SELECT
  p.client_id,
  'dummy-instagram-' || md5(random()::text || gs::text),
  (SELECT arr[1 + (random() * 9)::int] FROM captions),
  NOW() - (random() * 365 || ' days')::interval
        - (random() * 86400 || ' seconds')::interval,
  (400 + (random() * 30000))::int,
  (15 + (random() * 2000))::int,
  'https://www.instagram.com/reel/' || substr(md5(random()::text), 1, 11)
FROM params p, generate_series(1, 35) gs;

-- ---------------------------------------------------------------------------
--  Facebook — ca. 20 poster
-- ---------------------------------------------------------------------------
WITH params AS (
  SELECT '9916cb94-ef1b-46b9-9953-6508e659fa55'::uuid AS client_id
),
titles AS (
  SELECT ARRAY[
    'Nyhet fra teamet',
    'Ukens høydepunkt',
    'Slik var lanseringen',
    'Ny artikkel ute nå',
    'Sjekk ut den nye videoen vår',
    'Stor takk til kundene våre',
    'Vi feirer en milepæl',
    'Bli med på reisen videre',
    'Detaljer fra forrige uke',
    'Ny case-studie publisert'
  ] AS arr
)
INSERT INTO facebook_videos (
  client_id, facebook_video_id, title, posted_at,
  view_count, like_count, comment_count, share_count, permalink
)
SELECT
  p.client_id,
  'dummy-facebook-' || md5(random()::text || gs::text),
  (SELECT arr[1 + (random() * 9)::int] FROM titles),
  NOW() - (random() * 365 || ' days')::interval
        - (random() * 86400 || ' seconds')::interval,
  (200 + (random() * 18000))::int,
  (8 + (random() * 1200))::int,
  (random() * 70)::int,
  (random() * 200)::int,
  'https://www.facebook.com/watch?v=' || floor(random() * 1e15)::bigint::text
FROM params p, generate_series(1, 20) gs;

-- ---------------------------------------------------------------------------
--  Snapchat — ca. 25 poster (manuelt lagt inn)
-- ---------------------------------------------------------------------------
WITH params AS (
  SELECT '9916cb94-ef1b-46b9-9953-6508e659fa55'::uuid AS client_id
),
captions AS (
  SELECT ARRAY[
    'Snap fra dagens shoot',
    'Throwback til forrige helg',
    'Kjapp tutorial',
    'Helgens highlights',
    'Bak kulissene',
    'Spotlight: ukens tema',
    'Quick recap',
    'Sneak peek',
    'Reaksjon på nyheten',
    'Mini-update'
  ] AS arr
)
INSERT INTO snapchat_videos (
  client_id, snapchat_video_id, caption, posted_at,
  view_count, screenshot_count, share_count, permalink
)
SELECT
  p.client_id,
  'dummy-snapchat-' || md5(random()::text || gs::text),
  (SELECT arr[1 + (random() * 9)::int] FROM captions),
  NOW() - (random() * 365 || ' days')::interval
        - (random() * 86400 || ' seconds')::interval,
  (150 + (random() * 12000))::int,
  (random() * 600)::int,
  (random() * 150)::int,
  NULL
FROM params p, generate_series(1, 25) gs;

-- ---------------------------------------------------------------------------
--  Follower-snapshots — månedlige punkter de siste 12 månedene
--  (gir vekst-grafen i Analyse-fanen noe å vise)
-- ---------------------------------------------------------------------------
WITH params AS (
  SELECT '9916cb94-ef1b-46b9-9953-6508e659fa55'::uuid AS client_id
),
months AS (
  SELECT generate_series(0, 11) AS months_ago
),
platforms AS (
  -- (plattform, startfølgere, månedlig snittvekst)
  SELECT * FROM (VALUES
    ('tiktok',     12000, 220),
    ('youtube',     3500,  90),
    ('instagram',   8500, 150),
    ('facebook',    4200,  40),
    ('snapchat',    2100,  60)
  ) AS t(platform, base, growth)
)
INSERT INTO follower_snapshots (client_id, platform, follower_count, recorded_at)
SELECT
  p.client_id,
  pl.platform,
  -- følgere vokser litt med tilfeldig variasjon, og er høyest i dag
  GREATEST(
    pl.base,
    pl.base + ((11 - m.months_ago) * pl.growth) + ((random() - 0.5) * 80)::int
  ),
  date_trunc('month', NOW()) - (m.months_ago || ' months')::interval
FROM params p, months m, platforms pl;

-- ============================================================================
--  Ferdig. Gå til /dashboard og refresh.
--  Bruk evt. DELETE-snippetet på toppen for å rydde opp etterpå.
-- ============================================================================
