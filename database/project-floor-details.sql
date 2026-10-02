-- Run once against an existing database before deploying project floor/room editing.
-- Project fields, including floorDetails, are stored in the projects.data JSONB column.
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE projects ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE projects ADD COLUMN IF NOT EXISTS data jsonb DEFAULT '{}'::jsonb;
ALTER TABLE projects ALTER COLUMN data DROP NOT NULL;
