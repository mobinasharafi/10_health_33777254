-- This script inserts test data into our database.
-- The goal is for the marker to be able to log in using:
-- username: gold
-- password: smiths

USE health;

-- Insert default user gold with hashed password.
-- The password hash corresponds to 'smiths' using bcrypt.
INSERT INTO users (username, password)
VALUES ('gold', '$2b$10$N7dYLAAblEJLvXRIWC2I8.vCByUXEZ8SMsCw6owio4J0h/oY7SfXu');

-- Few examples for health records.
-- They show that the system is working and can store/retrieve data.

INSERT INTO records (user_id, activity, value)
VALUES 
(1, 'running', 5),
(1, 'walking', 3000),
(1, 'sleep', 7);
