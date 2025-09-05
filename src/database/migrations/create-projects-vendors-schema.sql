-- Projects & Vendors Relational Schema for MySQL
-- This schema supports a matching system between projects and vendors

-- Create the database (already handled by TypeORM configuration)
-- CREATE DATABASE IF NOT EXISTS `expander360`;
-- USE `expander360`;

-- =============================================
-- USERS TABLE (Already exists - acting as clients)
-- =============================================
-- The users table already exists with the following structure:
-- CREATE TABLE IF NOT EXISTS `users` (
--   `id` int(11) NOT NULL AUTO_INCREMENT,
--   `company_name` varchar(255) NOT NULL,
--   `contact_email` varchar(255) NOT NULL,
--   `password` varchar(255) NOT NULL,
--   `IsAdmin` tinyint(1) NOT NULL DEFAULT 0,
--   PRIMARY KEY (`id`)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- PROJECTS TABLE
-- =============================================
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
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `IDX_PROJECTS_USER_ID` (`user_id`),
  INDEX `IDX_PROJECTS_COUNTRY` (`country`),
  INDEX `IDX_PROJECTS_STATUS` (`status`),
  INDEX `IDX_PROJECTS_BUDGET` (`budget`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- VENDORS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS `vendors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `countries_supported` json NOT NULL COMMENT 'Array of supported countries',
  `services_offered` json NOT NULL COMMENT 'Array of offered service types',
  `rating` decimal(3,2) NOT NULL DEFAULT 0.00 COMMENT 'Rating from 0.00 to 5.00',
  `response_sla_hours` int(11) NOT NULL DEFAULT 24 COMMENT 'Response SLA in hours',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `IDX_VENDORS_NAME` (`name`),
  INDEX `IDX_VENDORS_RATING` (`rating`),
  INDEX `IDX_VENDORS_SLA` (`response_sla_hours`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- MATCHES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS `matches` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL,
  `vendor_id` int(11) NOT NULL,
  `score` decimal(5,2) NOT NULL COMMENT 'Match score from 0.00 to 100.00',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY `UK_MATCHES_PROJECT_VENDOR` (`project_id`, `vendor_id`),
  INDEX `IDX_MATCHES_PROJECT_ID` (`project_id`),
  INDEX `IDX_MATCHES_VENDOR_ID` (`vendor_id`),
  INDEX `IDX_MATCHES_SCORE` (`score` DESC),
  INDEX `IDX_MATCHES_CREATED_AT` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- SAMPLE DATA FOR TESTING
-- =============================================

-- Insert sample users (acting as clients)
-- Note: In practice, users will be created through the registration API
-- These are just for testing the schema relationships
INSERT IGNORE INTO `users` (`company_name`, `contact_email`, `password`, `IsAdmin`) VALUES
('TechCorp Solutions', 'contact@techcorp.com', '$2b$10$hashed_password_here', 0),
('Digital Innovations Ltd', 'hello@digitalinnovations.com', '$2b$10$hashed_password_here', 0),
('StartupX', 'team@startupx.io', '$2b$10$hashed_password_here', 0);

-- Insert sample vendors
INSERT IGNORE INTO `vendors` (`name`, `countries_supported`, `services_offered`, `rating`, `response_sla_hours`) VALUES
('WebDev Masters', '["USA", "Canada", "UK"]', '["web_development", "ui_ux_design"]', 4.8, 12),
('Mobile First Agency', '["USA", "Germany", "Australia"]', '["mobile_development", "ui_ux_design"]', 4.5, 24),
('Data Analytics Pro', '["USA", "India", "Singapore"]', '["data_analytics", "ai_ml"]', 4.9, 8),
('Cloud Solutions Inc', '["USA", "UK", "Germany", "Canada"]', '["cloud_services", "cybersecurity"]', 4.6, 16);

-- Insert sample projects
INSERT IGNORE INTO `projects` (`user_id`, `country`, `services_needed`, `budget`, `status`) VALUES
(1, 'USA', '["web_development", "ui_ux_design"]', 50000.00, 'active'),
(2, 'UK', '["mobile_development"]', 75000.00, 'draft'),
(3, 'Germany', '["data_analytics", "ai_ml"]', 100000.00, 'active');

-- Insert sample matches
INSERT IGNORE INTO `matches` (`project_id`, `vendor_id`, `score`) VALUES
(1, 1, 95.50),
(1, 2, 75.25),
(2, 2, 90.75),
(3, 3, 98.00),
(3, 4, 65.50);

-- =============================================
-- USEFUL QUERIES FOR THE RELATIONAL SCHEMA
-- =============================================

-- Query 1: Get all projects with their users (clients) and matches
/*
SELECT 
    p.id as project_id,
    u.company_name,
    u.contact_email,
    p.country,
    p.services_needed,
    p.budget,
    p.status,
    COUNT(m.id) as total_matches,
    MAX(m.score) as best_match_score
FROM projects p
JOIN users u ON p.user_id = u.id
LEFT JOIN matches m ON p.id = m.project_id
WHERE u.IsAdmin = 0  -- Only regular users (clients), not admins
GROUP BY p.id, u.company_name, u.contact_email, p.country, p.services_needed, p.budget, p.status
ORDER BY p.created_at DESC;
*/

-- Query 2: Find vendors that can serve a specific country and service
/*
SELECT DISTINCT v.*
FROM vendors v
WHERE JSON_CONTAINS(v.countries_supported, '"USA"')
  AND JSON_CONTAINS(v.services_offered, '"web_development"')
ORDER BY v.rating DESC, v.response_sla_hours ASC;
*/

-- Query 3: Get top matches for all projects
/*
SELECT 
    p.id as project_id,
    u.company_name as client,
    u.contact_email,
    v.name as vendor,
    m.score,
    p.budget,
    v.rating as vendor_rating
FROM matches m
JOIN projects p ON m.project_id = p.id
JOIN users u ON p.user_id = u.id
JOIN vendors v ON m.vendor_id = v.id
WHERE m.score > 80 AND u.IsAdmin = 0
ORDER BY m.score DESC
LIMIT 10;
*/

-- Query 4: Get vendor performance summary
/*
SELECT 
    v.id,
    v.name,
    v.rating,
    COUNT(m.id) as total_matches,
    AVG(m.score) as avg_match_score,
    SUM(p.budget) as total_potential_revenue
FROM vendors v
LEFT JOIN matches m ON v.id = m.vendor_id
LEFT JOIN projects p ON m.project_id = p.id
GROUP BY v.id, v.name, v.rating
ORDER BY avg_match_score DESC, total_potential_revenue DESC;
*/
