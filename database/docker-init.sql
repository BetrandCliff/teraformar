-- Docker-only seed account. Do not run this file in production.
-- Local credentials: docker-admin@example.com / DockerTest123!
INSERT INTO users (id, email, password_hash, full_name)
VALUES (
  'c7a51212-0189-4ac3-bbac-c5e3b1de5f08',
  'docker-admin@example.com',
  '$2b$10$7GIremIo4H7pdmWhhcW6iu72H1Oaq9s6nkonSK95KwEdFB.f2XSXC',
  'Docker Test Admin'
)
ON CONFLICT (email) DO NOTHING;
