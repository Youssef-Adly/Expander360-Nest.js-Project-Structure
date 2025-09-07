-- =============================================
-- MATCHES TABLE MIGRATION
-- =============================================
-- Create the matches table with all necessary fields and relationships

CREATE TABLE IF NOT EXISTS `matches` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL,
  `vendor_id` int(11) NOT NULL,
  `score` decimal(5,2) NOT NULL COMMENT 'Match score from 0.00 to 100.00',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_MATCHES_PROJECT_VENDOR` (`project_id`, `vendor_id`),
  INDEX `IDX_MATCHES_PROJECT_ID` (`project_id`),
  INDEX `IDX_MATCHES_VENDOR_ID` (`vendor_id`),
  INDEX `IDX_MATCHES_SCORE` (`score` DESC),
  INDEX `IDX_MATCHES_CREATED_AT` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key constraints if they don't exist
ALTER TABLE `matches` 
ADD CONSTRAINT `FK_MATCHES_PROJECT_ID` 
FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `matches` 
ADD CONSTRAINT `FK_MATCHES_VENDOR_ID` 
FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
