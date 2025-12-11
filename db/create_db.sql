-- This script creates the database called "health".
-- It also creates two tables: "users" and "records".
-- The "IF NOT EXISTS" part prevents errors if the database already exists.

CREATE DATABASE IF NOT EXISTS health;
USE health;

-- This table stores user accounts for login.
-- username will be 'gold' and password will be 'smiths' (or hash of it).

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- This table stores health records that belong to users and each record is linked to a user through user_id.

CREATE TABLE IF NOT EXISTS records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity VARCHAR(100) NOT NULL,
    value INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- This links each record to a user in the users table.
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
