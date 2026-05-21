-- Greenlist: e-poster som har tillatelse til å registrere seg
CREATE TABLE IF NOT EXISTS allowed_emails (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  added_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_allowed_emails_email ON allowed_emails (email);
