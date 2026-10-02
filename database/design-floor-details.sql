-- Run once against an existing database before deploying floor/room editing.
-- Floor and room values are stored in the design's JSON data and are optional.
CREATE TABLE IF NOT EXISTS designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE designs ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE designs ADD COLUMN IF NOT EXISTS data jsonb DEFAULT '{}'::jsonb;
ALTER TABLE designs ALTER COLUMN data DROP NOT NULL;
