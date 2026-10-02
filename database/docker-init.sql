CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  email varchar(255) NOT NULL UNIQUE,
  password_hash text NOT NULL,
  full_name varchar(255),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Local-only credentials: docker-admin@example.com / DockerTest123!
INSERT INTO users (id, email, password_hash, full_name)
VALUES (
  'c7a51212-0189-4ac3-bbac-c5e3b1de5f08',
  'docker-admin@example.com',
  '$2b$10$7GIremIo4H7pdmWhhcW6iu72H1Oaq9s6nkonSK95KwEdFB.f2XSXC',
  'Docker Test Admin'
)
ON CONFLICT (email) DO NOTHING;
