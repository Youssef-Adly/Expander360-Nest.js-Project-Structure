-- =============================================
-- VENDORS TABLE MIGRATION
-- =============================================
-- Create the vendors table with all necessary fields

CREATE TABLE IF NOT EXISTS `vendors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `countries_supported` json NOT NULL COMMENT 'Array of supported countries',
  `services_offered` json NOT NULL COMMENT 'Array of offered service types',
  `rating` decimal(3,2) NOT NULL DEFAULT 0.00 COMMENT 'Rating from 0.00 to 5.00',
  `response_sla_hours` int(11) NOT NULL DEFAULT 24 COMMENT 'Response SLA in hours',
  `sla_expires_at` datetime NULL COMMENT 'SLA expiration datetime',
  `sla_expired` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Whether SLA has expired',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `IDX_VENDORS_NAME` (`name`),
  INDEX `IDX_VENDORS_RATING` (`rating`),
  INDEX `IDX_VENDORS_SLA` (`response_sla_hours`),
  INDEX `IDX_VENDORS_SLA_EXPIRED` (`sla_expired`),
  INDEX `IDX_VENDORS_SLA_EXPIRES_AT` (`sla_expires_at`),
  INDEX `IDX_VENDORS_CREATED_AT` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

