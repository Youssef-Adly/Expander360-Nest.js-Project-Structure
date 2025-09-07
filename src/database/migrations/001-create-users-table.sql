-- =============================================
-- USERS TABLE MIGRATION
-- =============================================
-- Create the users table with all necessary fields

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `company_name` varchar(255) NOT NULL,
  `contact_email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `IsAdmin` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_USERS_EMAIL` (`contact_email`),
  INDEX `IDX_USERS_COMPANY` (`company_name`),
  INDEX `IDX_USERS_ADMIN` (`IsAdmin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
