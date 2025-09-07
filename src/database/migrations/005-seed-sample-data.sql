-- =============================================
-- SAMPLE DATA MIGRATION
-- =============================================
-- Insert sample data for testing purposes

-- Insert sample users (acting as clients)
-- Note: In practice, users will be created through the registration API
-- These are just for testing the schema relationships
INSERT IGNORE INTO `users` (`id`, `company_name`, `contact_email`, `password`, `IsAdmin`) VALUES
(1, 'TechCorp Solutions', 'contact@techcorp.com', '$2b$10$hashed_password_here', 0),
(2, 'Digital Innovations Ltd', 'hello@digitalinnovations.com', '$2b$10$hashed_password_here', 0),
(3, 'StartupX', 'team@startupx.io', '$2b$10$hashed_password_here', 0),
(4, 'System Admin', 'admin@expander360.com', '$2b$10$admin_password_here', 1);

-- Insert sample vendors
INSERT IGNORE INTO `vendors` (`id`, `name`, `countries_supported`, `services_offered`, `rating`, `response_sla_hours`, `sla_expired`) VALUES
(1, 'WebDev Masters', '["USA", "Canada", "UK"]', '["web_development", "ui_ux_design"]', 4.8, 12, 0),
(2, 'Mobile First Agency', '["USA", "Germany", "Australia"]', '["mobile_development", "ui_ux_design"]', 4.5, 24, 0),
(3, 'Data Analytics Pro', '["USA", "India", "Singapore"]', '["data_analytics", "ai_ml"]', 4.9, 8, 0),
(4, 'Cloud Solutions Inc', '["USA", "UK", "Germany", "Canada"]', '["cloud_services", "cybersecurity"]', 4.6, 16, 0),
(5, 'AI Innovations Hub', '["USA", "Canada", "UK", "Germany", "France"]', '["ai_ml", "data_analytics", "consulting"]', 4.7, 20, 0),
(6, 'Security Experts Ltd', '["USA", "UK", "Australia", "Germany"]', '["cybersecurity", "consulting"]', 4.8, 6, 0),
(7, 'Full Stack Developers', '["USA", "Canada", "Mexico"]', '["web_development", "mobile_development", "cloud_services"]', 4.4, 18, 0);

-- Insert sample projects
INSERT IGNORE INTO `projects` (`id`, `user_id`, `country`, `services_needed`, `budget`, `status`) VALUES
(1, 1, 'USA', '["web_development", "ui_ux_design"]', 50000.00, 'active'),
(2, 2, 'UK', '["mobile_development"]', 75000.00, 'draft'),
(3, 3, 'Germany', '["data_analytics", "ai_ml"]', 100000.00, 'active'),
(4, 1, 'Canada', '["cloud_services", "cybersecurity"]', 120000.00, 'draft'),
(5, 2, 'Australia', '["ai_ml", "consulting"]', 80000.00, 'active'),
(6, 3, 'USA', '["web_development", "mobile_development"]', 90000.00, 'paused');

-- Insert sample matches
INSERT IGNORE INTO `matches` (`id`, `project_id`, `vendor_id`, `score`) VALUES
(1, 1, 1, 95.50),
(2, 1, 2, 75.25),
(3, 1, 7, 88.75),
(4, 2, 2, 90.75),
(5, 2, 7, 82.50),
(6, 3, 3, 98.00),
(7, 3, 5, 92.25),
(8, 4, 4, 94.75),
(9, 4, 6, 88.50),
(10, 5, 3, 85.25),
(11, 5, 5, 96.75),
(12, 6, 1, 87.50),
(13, 6, 7, 91.25);
