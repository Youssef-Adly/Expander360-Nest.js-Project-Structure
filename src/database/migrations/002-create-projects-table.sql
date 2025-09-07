-- =============================================
-- PROJECTS TABLE MIGRATION
-- =============================================
-- Create the projects table with all necessary fields and relationships

CREATE TABLE IF NOT EXISTS `projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `country` varchar(100) NOT NULL,
  `services_needed` json NOT NULL COMMENT 'Array of required service types',
  `budget` decimal(12,2) NOT NULL,
  `status` enum('draft','active','paused','completed','cancelled') NOT NULL DEFAULT 'draft',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `IDX_PROJECTS_USER_ID` (`user_id`),
  INDEX `IDX_PROJECTS_COUNTRY` (`country`),
  INDEX `IDX_PROJECTS_STATUS` (`status`),
  INDEX `IDX_PROJECTS_BUDGET` (`budget`),
  INDEX `IDX_PROJECTS_CREATED_AT` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key constraint for user_id if it doesn't exist
ALTER TABLE `projects` 
ADD CONSTRAINT `FK_PROJECTS_USER_ID` 
FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
