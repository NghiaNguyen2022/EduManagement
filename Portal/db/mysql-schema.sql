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

CREATE TABLE IF NOT EXISTS admin_users (
  username VARCHAR(191) PRIMARY KEY,
  password_hash TEXT NOT NULL,
  salt VARCHAR(255) NOT NULL,
  iterations INT NOT NULL,
  created_at DATETIME(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
  token CHAR(64) PRIMARY KEY,
  expires_at BIGINT NOT NULL,
  INDEX idx_sessions_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS posts (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  body LONGTEXT NOT NULL,
  tags JSON NOT NULL,
  cover_image_key VARCHAR(1000) NULL,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  INDEX idx_posts_published_created (published, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reviews (
  id CHAR(36) PRIMARY KEY,
  app_slug VARCHAR(191) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(100) NULL,
  email VARCHAR(320) NULL,
  rating TINYINT UNSIGNED NOT NULL,
  comment TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at DATETIME(3) NOT NULL,
  INDEX idx_reviews_app_status_created (app_slug, status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comments (
  id CHAR(36) PRIMARY KEY,
  post_id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  comment TEXT NOT NULL,
  created_at DATETIME(3) NOT NULL,
  INDEX idx_comments_post_created (post_id, created_at),
  CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS app_content (
  slug VARCHAR(191) PRIMARY KEY,
  demo_video_url TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS apps (
  slug VARCHAR(191) PRIMARY KEY,
  code VARCHAR(20) NOT NULL,
  eyebrow_vi VARCHAR(255) NOT NULL,
  eyebrow_en VARCHAR(255) NULL,
  title_vi VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NULL,
  description_vi TEXT NOT NULL,
  description_en TEXT NULL,
  long_description_vi TEXT NOT NULL,
  long_description_en TEXT NULL,
  href VARCHAR(1000) NOT NULL,
  action_vi VARCHAR(255) NOT NULL,
  action_en VARCHAR(255) NULL,
  tone ENUM('blue', 'amber', 'slate') NOT NULL DEFAULT 'blue',
  has_detail_page BOOLEAN NOT NULL DEFAULT TRUE,
  highlights_vi JSON NOT NULL,
  highlights_en JSON NULL,
  customers JSON NOT NULL,
  base_rating DECIMAL(2,1) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  INDEX idx_apps_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS app_documents (
  id CHAR(36) PRIMARY KEY,
  app_slug VARCHAR(191) NOT NULL,
  name VARCHAR(500) NOT NULL,
  file_key VARCHAR(1000) NOT NULL,
  content_type VARCHAR(255) NOT NULL,
  size BIGINT UNSIGNED NOT NULL,
  uploaded_at DATETIME(3) NOT NULL,
  INDEX idx_documents_app_uploaded (app_slug, uploaded_at),
  CONSTRAINT fk_documents_app FOREIGN KEY (app_slug) REFERENCES app_content(slug) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS page_views (
  id CHAR(36) PRIMARY KEY,
  kind ENUM('site', 'post', 'app') NOT NULL,
  ref_key VARCHAR(191) NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_page_views_created (created_at),
  INDEX idx_page_views_kind_ref (kind, ref_key, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
