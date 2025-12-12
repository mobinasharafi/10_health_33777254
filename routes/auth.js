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
router.get('/usr/455/registered', (req, res) => {
    res.render('registered');
});

// Profile page (GET request): shows the form filled with the user's current information
router.get('/usr/455/profile', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect('/usr/455/login');
        }

        const [rows] = await db.query(
            "SELECT first_name, last_name, age, height_cm, weight_kg, bmi, bmi_category, goal FROM users WHERE id = ?",
            [req.session.userId]
        );

        if (rows.length === 0) {
            return res.redirect('/usr/455/');
        }

        const user = rows[0];
        res.render('profile', { user, session: req.session });

    } catch (error) {
        console.error(error);
        res.send("Something went wrong while trying to load your profile.");
    }
});

// Handle profile update (POST request)
router.post('/usr/455/profile', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect('/usr/455/login');
        }

        const {
            first_name,
            last_name,
            age,
            height_cm,
            weight_kg,
            goal,
            goal_other
        } = req.body;

        const ageNum = age ? parseInt(age, 10) : null;
        const heightNum = height_cm ? parseInt(height_cm, 10) : null;
        const weightNum = weight_kg ? parseInt(weight_kg, 10) : null;

        let finalGoal = goal;
        if (goal === 'Other' && goal_other && goal_other.trim() !== "") {
            finalGoal = goal_other.trim();
        }

        let bmiValue = null;
        if (heightNum && weightNum && heightNum > 0) {
            const heightM = heightNum / 100;
            const bmi = weightNum / (heightM * heightM);
            bmiValue = Number(bmi.toFixed(2));
        }

        const bmiCategory = classifyBMI(bmiValue);

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

        req.session.success = "Profile updated successfully.";

        return res.redirect('/usr/455/profile');

    } catch (error) {
        console.error(error);
        res.send("Something went wrong while trying to update your profile.");
    }
});

// Registration page (GET request)
router.get('/usr/455/register', (req, res) => {
    res.render('register');
});

// Handle registration form (POST request)
router.post('/usr/455/register', async (req, res) => {
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
        if (password.length < 8) {
            req.session.error = "Password must be at least 8 characters long.";
            return res.redirect('/usr/455/register');
        }
        if (!/[0-9]/.test(password)) {
            req.session.error = "Password must contain at least one number.";
            return res.redirect('/usr/455/register');
        }
        if (!/[A-Za-z]/.test(password)) {
            req.session.error = "Password must contain at least one letter.";
            return res.redirect('/usr/455/register');
        }

        const ageNum = age ? parseInt(age, 10) : null;
        const heightNum = height_cm ? parseInt(height_cm, 10) : null;
        const weightNum = weight_kg ? parseInt(weight_kg, 10) : null;

        if (!ageNum || ageNum < 1 || ageNum > 120) {
            req.session.error = "Please enter a valid age.";
            return res.redirect('/usr/455/register');
        }
        if (!heightNum || heightNum < 50 || heightNum > 250) {
            req.session.error = "Please enter a realistic height in cm.";
            return res.redirect('/usr/455/register');
        }
        if (!weightNum || weightNum < 20 || weightNum > 300) {
            req.session.error = "Please enter a realistic weight in kg.";
            return res.redirect('/usr/455/register');
        }

        let finalGoal = goal;
        if (goal === 'Other' && goal_other && goal_other.trim() !== "") {
            finalGoal = goal_other.trim();
        }

        const heightM = heightNum / 100;
        let bmiValue = null;
        if (heightM > 0) {
            const bmi = weightNum / (heightM * heightM);
            bmiValue = Number(bmi.toFixed(2));
        }

        const bmiCategory = classifyBMI(bmiValue);

        const [user] = await db.query(
            "SELECT id FROM users WHERE username = ?",
            [username]
        );

        if (user.length > 0) {
            req.session.error = "This username is already taken.";
            return res.redirect('/usr/455/register');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

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

        res.redirect('/usr/455/registered');

    } catch (error) {
        console.error(error);
        res.send("Something went wrong while trying to register.");
    }
});

// Login page (GET request)
router.get('/usr/455/login', (req, res) => {
    res.render('login');
});

// Handle login form (POST request)
router.post('/usr/455/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await db.query(
            "SELECT * FROM users WHERE username = ?",
            [username]
        );

        if (rows.length === 0) {
            req.session.error = "Username or password is incorrect.";
            return res.redirect('/usr/455/login');
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            req.session.error = "Username or password is incorrect.";
            return res.redirect('/usr/455/login');
        }

        req.session.userId = user.id;

        res.redirect('/usr/455/');

    } catch (error) {
        console.error(error);
        res.send("Something went wrong while trying to log in.");
    }
});

// Logout route (GET request)
router.get('/usr/455/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/usr/455/login');
    });
});

module.exports = router;