-- Lar brukere overstyre merkenavnet som vises øverst i PDF-rapporter
-- per kunde. Hvis NULL/tom brukes klientnavnet som fallback.

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS report_brand text;
