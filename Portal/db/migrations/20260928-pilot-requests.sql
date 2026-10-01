CREATE TABLE IF NOT EXISTS pilot_requests (
  id CHAR(36) PRIMARY KEY,
  app_slug VARCHAR(80) NOT NULL,
  name VARCHAR(100) NOT NULL,
  organization VARCHAR(200) NOT NULL,
  contact VARCHAR(200) NOT NULL,
  need TEXT NOT NULL,
  status ENUM('new', 'contacted', 'piloting', 'closed') NOT NULL DEFAULT 'new',
  consent_at DATETIME(3) NOT NULL,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  dedupe_key CHAR(64) NOT NULL,
  UNIQUE KEY idx_pilot_dedupe (dedupe_key),
  INDEX idx_pilot_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
