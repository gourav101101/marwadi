-- Marwadi Finance broker: recent settings and enquiry updates (27 October 2026)
-- MySQL / MariaDB only. Select your LIVE database before importing.
-- Back up the full database first. Existing workspace tables and migrations table required.
-- Adds columns only; does not delete, replace, or import client records.
-- MySQL DDL can auto-commit: this is not an all-or-nothing transaction.

CREATE TABLE IF NOT EXISTS `enquiries` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(200) NOT NULL,
  `phone` VARCHAR(25) NOT NULL,
  `interest` VARCHAR(255) NOT NULL,
  `message` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add workspace_settings.business_name only when missing.
SET @marwadi_sql = IF(
  EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'workspace_settings' AND COLUMN_NAME = 'business_name'),
  'SELECT 1 AS column_already_exists',
  'ALTER TABLE `workspace_settings` ADD COLUMN `business_name` VARCHAR(100) NULL'
);
PREPARE marwadi_statement FROM @marwadi_sql;
EXECUTE marwadi_statement;
DEALLOCATE PREPARE marwadi_statement;

-- Add workspace_settings.business_email only when missing.
SET @marwadi_sql = IF(
  EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'workspace_settings' AND COLUMN_NAME = 'business_email'),
  'SELECT 1 AS column_already_exists',
  'ALTER TABLE `workspace_settings` ADD COLUMN `business_email` VARCHAR(160) NULL'
);
PREPARE marwadi_statement FROM @marwadi_sql;
EXECUTE marwadi_statement;
DEALLOCATE PREPARE marwadi_statement;

-- Add workspace_settings.business_phone only when missing.
SET @marwadi_sql = IF(
  EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'workspace_settings' AND COLUMN_NAME = 'business_phone'),
  'SELECT 1 AS column_already_exists',
  'ALTER TABLE `workspace_settings` ADD COLUMN `business_phone` VARCHAR(25) NULL'
);
PREPARE marwadi_statement FROM @marwadi_sql;
EXECUTE marwadi_statement;
DEALLOCATE PREPARE marwadi_statement;

-- Add workspace_settings.social_links only when missing.
SET @marwadi_sql = IF(
  EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'workspace_settings' AND COLUMN_NAME = 'social_links'),
  'SELECT 1 AS column_already_exists',
  'ALTER TABLE `workspace_settings` ADD COLUMN `social_links` JSON NULL'
);
PREPARE marwadi_statement FROM @marwadi_sql;
EXECUTE marwadi_statement;
DEALLOCATE PREPARE marwadi_statement;

-- Add enquiries.city only when missing.
SET @marwadi_sql = IF(
  EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'enquiries' AND COLUMN_NAME = 'city'),
  'SELECT 1 AS column_already_exists',
  'ALTER TABLE `enquiries` ADD COLUMN `city` VARCHAR(100) NULL'
);
PREPARE marwadi_statement FROM @marwadi_sql;
EXECUTE marwadi_statement;
DEALLOCATE PREPARE marwadi_statement;

-- Add enquiries.email_sent_at only when missing.
SET @marwadi_sql = IF(
  EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'enquiries' AND COLUMN_NAME = 'email_sent_at'),
  'SELECT 1 AS column_already_exists',
  'ALTER TABLE `enquiries` ADD COLUMN `email_sent_at` TIMESTAMP NULL DEFAULT NULL'
);
PREPARE marwadi_statement FROM @marwadi_sql;
EXECUTE marwadi_statement;
DEALLOCATE PREPARE marwadi_statement;

-- Register the equivalent Laravel migrations so future artisan migrate skips them.
-- Existing records in migrations are preserved; re-import does not duplicate them.
SET @marwadi_batch = (SELECT COALESCE(MAX(batch), 0) + 1 FROM migrations);

INSERT INTO migrations (migration, batch)
SELECT '2026_10_26_000001_create_enquiries_table', @marwadi_batch
WHERE NOT EXISTS (SELECT 1 FROM migrations WHERE migration = '2026_10_26_000001_create_enquiries_table');

INSERT INTO migrations (migration, batch)
SELECT '2026_10_27_000001_add_website_contact_settings', @marwadi_batch
WHERE NOT EXISTS (SELECT 1 FROM migrations WHERE migration = '2026_10_27_000001_add_website_contact_settings');

INSERT INTO migrations (migration, batch)
SELECT '2026_10_27_000002_add_social_links_to_workspace_settings', @marwadi_batch
WHERE NOT EXISTS (SELECT 1 FROM migrations WHERE migration = '2026_10_27_000002_add_social_links_to_workspace_settings');

INSERT INTO migrations (migration, batch)
SELECT '2026_10_27_000003_add_enquiry_email_details', @marwadi_batch
WHERE NOT EXISTS (SELECT 1 FROM migrations WHERE migration = '2026_10_27_000003_add_enquiry_email_details');

-- Verify the added columns after importing.
SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND (
  (TABLE_NAME = 'workspace_settings' AND COLUMN_NAME IN ('business_name', 'business_email', 'business_phone', 'social_links'))
  OR (TABLE_NAME = 'enquiries' AND COLUMN_NAME IN ('city', 'email_sent_at'))
)
ORDER BY TABLE_NAME, COLUMN_NAME;

