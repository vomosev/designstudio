-- Prism Studio — MySQL schema
-- Usage: mysql -u <user> -p <database> < schema.sql
-- Charset: utf8mb4 / Engine: InnoDB

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin','editor') NOT NULL DEFAULT 'editor',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- projects (portfolio)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug          VARCHAR(190) NOT NULL,
  title         VARCHAR(190) NOT NULL,
  client        VARCHAR(160) NOT NULL DEFAULT '',
  category      VARCHAR(60)  NOT NULL DEFAULT 'Branding',
  year          SMALLINT UNSIGNED NOT NULL DEFAULT 2024,
  summary       VARCHAR(280) NOT NULL DEFAULT '',
  body          TEXT NULL,
  palette       VARCHAR(255) NOT NULL DEFAULT '',
  cover_hue     SMALLINT UNSIGNED NOT NULL DEFAULT 12,
  cover_hue_end SMALLINT UNSIGNED NOT NULL DEFAULT 268,
  featured      TINYINT(1) NOT NULL DEFAULT 0,
  status        ENUM('draft','published') NOT NULL DEFAULT 'published',
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_projects_slug (slug),
  KEY idx_projects_category (category),
  KEY idx_projects_status (status),
  KEY idx_projects_featured (featured),
  KEY idx_projects_sort (sort_order, year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- inquiries (contact form submissions)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inquiries (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name         VARCHAR(160) NOT NULL,
  email        VARCHAR(190) NOT NULL,
  company      VARCHAR(160) NULL,
  budget_range VARCHAR(80)  NULL,
  service      VARCHAR(120) NULL,
  message      TEXT NOT NULL,
  status       ENUM('new','in_review','replied','archived') NOT NULL DEFAULT 'new',
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_inquiries_status (status),
  KEY idx_inquiries_created (created_at),
  KEY idx_inquiries_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- sessions (required by express-mysql-session)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
  session_id VARCHAR(128) NOT NULL,
  expires    INT UNSIGNED NOT NULL,
  data       MEDIUMTEXT NULL,
  PRIMARY KEY (session_id),
  KEY idx_sessions_expires (expires)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;