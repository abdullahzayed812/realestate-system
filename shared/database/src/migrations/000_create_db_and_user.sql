-- ============================================================
-- Run this as MySQL root BEFORE running the schema migration
-- Usage: mysql -u root -p < 000_create_db_and_user.sql
-- ============================================================

-- Create database
CREATE DATABASE IF NOT EXISTS `realestate_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Create user if not exists, then grant privileges
-- CREATE USER IF NOT EXISTS 'abdo'@'localhost' IDENTIFIED BY 'password';
-- CREATE USER IF NOT EXISTS 'abdo'@'%'         IDENTIFIED BY 'password';

-- GRANT ALL PRIVILEGES ON `realestate_db`.* TO 'abdo'@'localhost';
-- GRANT ALL PRIVILEGES ON `realestate_db`.* TO 'abdo'@'%';

-- FLUSH PRIVILEGES;

-- Verify
-- SELECT User, Host FROM mysql.user WHERE User = 'abdo';
-- SHOW GRANTS FOR 'abdo'@'localhost';
