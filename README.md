# Gjensvar

Gjensvar er en SaaS-dashboard-applikasjon utviklet for markedsføringsbyrået
Serotonic. Plattformen samler video- og innholdsstatistikk fra TikTok,
Instagram, YouTube Shorts, Facebook og Snapchat på tvers av flere kunder, og
gjør det mulig å analysere, sammenligne og eksportere data som rapporter i
CSV- og PDF-format.

Applikasjonen er bygget som en del av en bacheloroppgave ved
[institusjonsnavn], med fokus på hvordan KI-assistert utvikling kan brukes
til å levere en produksjonsklar SaaS-applikasjon for små og mellomstore
bedrifter (SMB).

## Funksjoner

- **Multi-kundesystem** med dataadskillelse og kundebytter
- **OAuth-integrasjoner** mot Meta (Instagram + Facebook), TikTok og
  Google/YouTube – samt manuell datainntasting for Snapchat
- **Sammenslått videooversikt** som matcher samme video på tvers av
  plattformer basert på postdato
- **Analyser**: trendgrafer, topp-10-videoer, plattformfordeling og månedlig
  postfrekvens
- **PDF- og CSV-eksport** med tilpassbar firmabranding per kunde
- **Rolle- og tilgangsstyring** via admin-godkjent greenlist
- **Flerspråklig grensesnitt** (norsk og engelsk) på tvers av hele
  applikasjonen
- **Mørkt, glassmorfisk design** bygget på Tailwind CSS 4

## Teknisk stack

| Lag | Teknologi |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, Geist-fonten, JetBrains Mono |
| Backend | Next.js Server Actions + Route Handlers |
| Database | PostgreSQL via Supabase |
| Autentisering | Supabase Auth (JWT i httpOnly-cookies) |
| Grafer | Recharts |
| Rapporter | jsPDF + jspdf-autotable |
| Hosting | Vercel (edge runtime for middleware) |

## Sikkerhetstiltak

- **`requireActiveClient()`** brukes i alle server actions og route handlers
  som leser eller skriver kundedata, og verifiserer både innlogging og
  medlemskap i den aktive kunden.
- **CSRF-beskyttelse** i OAuth-flyten for Meta (state-parameter) og TikTok
  (PKCE med S256 code challenge).
- **API-nøkler og hemmeligheter** lagres utelukkende i miljøvariabler og
  eksponeres aldri i klienten.
- **Row Level Security (RLS)** på Supabase-tabeller som ekstra forsvarslag.

## Oppsett lokalt

### Forutsetninger

- Node.js 20 eller nyere
- En Supabase-konto med et nytt prosjekt
- Utviklerkonto hos Meta, TikTok og Google (Cloud Console) hvis du vil teste
  alle plattformintegrasjoner

### Installasjon

```bash
git clone https://github.com/<your-user>/gjensvar.git
cd gjensvar
npm install
```

### Miljøvariabler

Opprett en fil `.env.local` i prosjektrota med følgende verdier:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=

YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=

META_APP_ID=
META_APP_SECRET=

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database

Kjør migrasjonsfilene under `migrations/` i Supabase SQL-editoren i
rekkefølge (`001` → `008`).

Hvis du vil teste applikasjonen uten å koble til faktiske OAuth-integrasjoner
kan du seede dummy-data med:

```sql
-- I Supabase SQL-editor, etter at migrasjonene er kjørt:
-- Følg instruksene i scripts/seed_dummy_data.sql
```

### Start utviklingsserveren

```bash
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000) i nettleseren.

## Prosjektstruktur

```
app/                Next.js App Router – sider, server actions, API-routes
  actions/          Server actions (CRUD, sync, autorisasjon)
  api/              OAuth-callbacks og sync-endepunkter
  dashboard/        Dashboard-sidene (server components)
  (auth-sider)/     login, signup, forgot-password, reset-password, …
  (juridiske)/      terms, privacy, data-deletion
components/         Klientkomponenter (UI, modaler, grafer, tabeller)
lib/                Felles biblioteker (Supabase-klienter, API-helpers,
                    eksportverktøy, i18n-system)
migrations/         SQL-migrasjoner for Supabase
scripts/            Hjelpe-scripts og dummy-data-seed
public/             Statiske assets (logoer, ikoner)
```

## Kjente begrensninger

- YouTube/Google-OAuth-flyten bruker hverken `state`-parameter eller PKCE.
  Risikoen er begrenset siden Gjensvar i utgangspunktet er en intern
  applikasjon for Serotonic, men det er en kjent mangel.
- `components/DashboardContent.tsx` og `lib/exportUtils.ts` har vokst til
  henholdsvis 2031 og 1492 linjer. Begge bør deles opp i mindre moduler hvis
  applikasjonen skal videreutvikles.

## Lisens

Prosjektet er utviklet som en bacheloroppgave og er ikke utstedt under en
åpen lisens. All bruk eller videreutvikling krever samtykke fra forfatteren.

## Kontakt

Sander Kapstad — [sander@kapstadmedia.no](mailto:sander@kapstadmedia.no)
