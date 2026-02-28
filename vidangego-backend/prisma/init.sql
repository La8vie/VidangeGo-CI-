-- VidangeGo CI Database Initialization
-- This script runs when the MySQL container starts for the first time

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS vidangego CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE vidangego;

-- Create a default admin user (password: admin123)
-- This will be created by the application's seed script
-- INSERT INTO User (id, email, password, name, role, createdAt, updatedAt) 
-- VALUES ('admin-default', 'admin@vidangego.ci', '$2b$10$placeholder_hash', 'Admin VidangeGo', 'ADMIN', NOW(), NOW());

-- Grant permissions
GRANT ALL PRIVILEGES ON vidangego.* TO 'vidangego_user'@'%';
FLUSH PRIVILEGES;
