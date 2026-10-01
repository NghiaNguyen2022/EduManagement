CREATE TABLE IF NOT EXISTS tool_settings (
  id INT PRIMARY KEY,
  settings_json LONGTEXT NOT NULL,
  secrets_json LONGTEXT NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS tool_access (
  job_id CHAR(36) PRIMARY KEY,
  recovery_hash CHAR(64) NOT NULL UNIQUE,
  recovery_cipher TEXT NOT NULL,
  amount INT NOT NULL DEFAULT 0,
  payment_status VARCHAR(24) NOT NULL DEFAULT 'free',
  payment_json TEXT NULL,
  approved_at DATETIME NULL,
  approved_by CHAR(64) NULL,
  storage_provider VARCHAR(12) NOT NULL DEFAULT 'local',
  CONSTRAINT tool_access_job FOREIGN KEY (job_id) REFERENCES tool_jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS tool_access_sessions (
  job_id CHAR(36) NOT NULL,
  owner_hash CHAR(64) NOT NULL,
  PRIMARY KEY(job_id,owner_hash),
  CONSTRAINT tool_access_session_job FOREIGN KEY (job_id) REFERENCES tool_jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS tool_cloud_files (
  file_id CHAR(36) PRIMARY KEY,
  drive_id VARCHAR(180) NOT NULL UNIQUE,
  synced TINYINT NOT NULL DEFAULT 0,
  CONSTRAINT tool_cloud_file FOREIGN KEY (file_id) REFERENCES tool_files(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS tool_oauth_states (
  state_hash CHAR(64) PRIMARY KEY,
  admin_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS tool_payment_audit (
  id CHAR(36) PRIMARY KEY,
  job_id CHAR(36) NOT NULL,
  action VARCHAR(30) NOT NULL,
  admin_hash CHAR(64) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT tool_audit_job FOREIGN KEY(job_id) REFERENCES tool_jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
