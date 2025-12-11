// This file contains all the routes related to log in, log out and registration.
// Kept separate from index.js to keep the project clean.

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');

// Simple helper that returns a BMI classification based on the BMI value
function classifyBMI(bmi) {
    if (!bmi) return null;

    if (bmi < 16) return "Severely Underweight";
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    if (bmi < 35) return "Obesity Class I";
    if (bmi < 40) return "Obesity Class II";
    return "Obesity Class III";
}

// Registration success page (simple confirmation)
router.get('/registered', (req, res) => {
    res.render('registered');
});

// Profile page (GET request): shows the form filled with the user's current information
router.get('/profile', async (req, res) => {
    try {
        // If the user is not logged in, send them to login page
        if (!req.session.userId) {
            return res.redirect('login');
        }

        // Load the user's current data from the database (including BMI category)
        const [rows] = await db.query(
            "SELECT first_name, last_name, age, height_cm, weight_kg, bmi, bmi_category, goal FROM users WHERE id = ?",
            [req.session.userId]
        );

        // If no user found, go back home
        if (rows.length === 0) {
            return res.redirect('./');
        }

        const user = rows[0];

        // Render the profile page with existing user data
        res.render('profile', { user, session: req.session });

    } catch (error) {
        console.error(error);
        res.send("Something went wrong while trying to load your profile.");
    }
});

// Handle profile update (POST request)
router.post('/profile', async (req, res) => {
    try {
        // If user not logged in, redirect to login
        if (!req.session.userId) {
            return res.redirect('login');
        }

        // Take form values from the submitted profile form
        const {
            first_name,
            last_name,
            age,
            height_cm,
            weight_kg,
            goal,
            goal_other
        } = req.body;

        // Convert numeric fields
        const ageNum = age ? parseInt(age, 10) : null;
        const heightNum = height_cm ? parseInt(height_cm, 10) : null;
        const weightNum = weight_kg ? parseInt(weight_kg, 10) : null;

        // Decide on the final goal value
        let finalGoal = goal;
        if (goal === 'Other' && goal_other && goal_other.trim() !== "") {
            finalGoal = goal_other.trim();
        }

        // Recalculate BMI based on height and weight
        let bmiValue = null;
        if (heightNum && weightNum && heightNum > 0) {
            const heightM = heightNum / 100;
            const bmi = weightNum / (heightM * heightM);
            bmiValue = Number(bmi.toFixed(2));
        }

        // Determine BMI category
        const bmiCategory = classifyBMI(bmiValue);

        // Update database with new details including BMI category
        await db.query(
            "UPDATE users SET first_name = ?, last_name = ?, age = ?, height_cm = ?, weight_kg = ?, bmi = ?, bmi_category = ?, goal = ? WHERE id = ?",
            [
                first_name,
                last_name,
                ageNum,
                heightNum,
                weightNum,
                bmiValue,
                bmiCategory,
                finalGoal,
                req.session.userId
            ]
        );

        // Show a success message after saving
        req.session.success = "Profile updated successfully.";

        return res.redirect('profile');

    } catch (error) {
        console.error(error);
        res.send("Something went wrong while trying to update your profile.");
    }
});

// Registration page (GET request)
router.get('/register', (req, res) => {
    res.render('register');
});

// Handle registration form (POST request)
router.post('/register', async (req, res) => {
    const {
        username,
        password,
        first_name,
        last_name,
        age,
        height_cm,
        weight_kg,
        goal,
        goal_other
    } = req.body;

    try {
        // Basic password validation so users cannot register weak passwords
        if (password.length < 8) {
            req.session.error = "Password must be at least 8 characters long.";
            return res.redirect('register');
        }
        if (!/[0-9]/.test(password)) {
            req.session.error = "Password must contain at least one number.";
            return res.redirect('register');
        }
        if (!/[A-Za-z]/.test(password)) {
            req.session.error = "Password must contain at least one letter.";
            return res.redirect('register');
        }

        // Convert numeric inputs
        const ageNum = age ? parseInt(age, 10) : null;
        const heightNum = height_cm ? parseInt(height_cm, 10) : null;
        const weightNum = weight_kg ? parseInt(weight_kg, 10) : null;

        // Basic sanity checks for age, height and weight
        if (!ageNum || ageNum < 1 || ageNum > 120) {
            req.session.error = "Please enter a valid age.";
            return res.redirect('register');
        }
        if (!heightNum || heightNum < 50 || heightNum > 250) {
            req.session.error = "Please enter a realistic height in cm.";
            return res.redirect('register');
        }
        if (!weightNum || weightNum < 20 || weightNum > 300) {
            req.session.error = "Please enter a realistic weight in kg.";
            return res.redirect('register');
        }

        // Decide on the final goal string
        let finalGoal = goal;
        if (goal === 'Other' && goal_other && goal_other.trim() !== "") {
            finalGoal = goal_other.trim();
        }

        // Calculate BMI from height (cm) and weight (kg)
        const heightM = heightNum / 100;
        let bmiValue = null;
        if (heightM > 0) {
            const bmi = weightNum / (heightM * heightM);
            bmiValue = Number(bmi.toFixed(2));
        }

        // Determine BMI category
        const bmiCategory = classifyBMI(bmiValue);

        // Check if someone already registered with this username
        const [user] = await db.query(
            "SELECT id FROM users WHERE username = ?",
            [username]
        );

        if (user.length > 0) {
            req.session.error = "This username is already taken.";
            return res.redirect('register');
        }

        // Turn the password into a secure hash
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save the new user into the database including BMI category
        await db.query(
            "INSERT INTO users (username, password, first_name, last_name, age, height_cm, weight_kg, bmi, bmi_category, goal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                username,
                hashedPassword,
                first_name,
                last_name,
                ageNum,
                heightNum,
                weightNum,
                bmiValue,
                bmiCategory,
                finalGoal
            ]
        );

        // Instead of logging them in automatically, show a welcome page
        res.redirect('registered');

    } catch (error) {
        console.error(error);
        res.send("Something went wrong while trying to register.");
    }
});

// Login page (GET request)
router.get('/login', (req, res) => {
    res.render('login');
});

// Handle login form (POST request)
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Look up the user in the database
        const [rows] = await db.query(
            "SELECT * FROM users WHERE username = ?",
            [username]
        );

        // If no user exists, show an error message
        if (rows.length === 0) {
            req.session.error = "Username or password is incorrect.";
            return res.redirect('login');
        }

        const user = rows[0];

        // Compare the typed password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        // If it does not match, show an error message
        if (!isMatch) {
            req.session.error = "Username or password is incorrect.";
            return res.redirect('login');
        }

        // Login successful, store in the session
        req.session.userId = user.id;

        // Go to home page
        res.redirect('./');

    } catch (error) {
        console.error(error);
        res.send("Something went wrong while trying to log in.");
    }
});

// Logout route (GET request)
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('login');
    });
});

module.exports = router;

