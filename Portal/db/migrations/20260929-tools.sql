CREATE TABLE IF NOT EXISTS tool_sessions (
  token_hash CHAR(64) PRIMARY KEY,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  INDEX (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tool_jobs (
  id CHAR(36) PRIMARY KEY,
  owner_hash CHAR(64) NOT NULL,
  request_key CHAR(36) NOT NULL,
  tool_type VARCHAR(24) NOT NULL DEFAULT 'excel',
  status VARCHAR(24) NOT NULL DEFAULT 'uploading',
  phase VARCHAR(16) NOT NULL DEFAULT 'inspect',
  operation VARCHAR(24) NULL,
  configuration_json LONGTEXT NULL,
  metadata_json LONGTEXT NULL,
  result_summary_json LONGTEXT NULL,
  entitlement VARCHAR(16) NOT NULL DEFAULT 'free_beta',
  error_code VARCHAR(40) NULL,
  error_message VARCHAR(255) NULL,
  attempts INT NOT NULL DEFAULT 0,
  claimed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  cleaned_at DATETIME NULL,
  UNIQUE KEY owner_request (owner_hash, request_key),
  INDEX queue_status (status, created_at),
  INDEX expiration (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tool_files (
  id CHAR(36) PRIMARY KEY,
  job_id CHAR(36) NOT NULL,
  role VARCHAR(16) NOT NULL,
  ordinal INT NOT NULL DEFAULT 0,
  storage_key VARCHAR(100) NOT NULL,
  original_filename VARCHAR(180) NOT NULL,
  size_bytes BIGINT NOT NULL,
  sha256 CHAR(64) NULL,
  uploaded TINYINT NOT NULL DEFAULT 0,
  INDEX job_role (job_id, role),
  CONSTRAINT tools_files_job FOREIGN KEY (job_id) REFERENCES tool_jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tool_rate_limits (
  bucket_key VARCHAR(100) PRIMARY KEY,
  hits INT NOT NULL,
  expires_at DATETIME NOT NULL,
  INDEX (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tool_runtime (
  id INT PRIMARY KEY,
  heartbeat_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
