// This file contains all routes related to Dietary Intake logging.
// It includes two main sections:
// 1) Food tracking (meal logs)
// 2) Hydration tracking (water intake logs)

const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Show diet dashboard (food logs + hydration logs)
router.get('/diet', async (req, res) => {
    // Protect this route: user must be logged in
    if (!req.session.userId) return res.redirect('/login');

    try {
        // Get recent food logs for the user
        const [foodRows] = await db.query(
            `SELECT id, meal_type, food_name, calories, notes, logged_at
             FROM diet_logs
             WHERE user_id = ?
             ORDER BY logged_at DESC
             LIMIT 30`,
            [req.session.userId]
        );

        // Get hydration logs
        const [hydrationRows] = await db.query(
            `SELECT id, amount_ml, logged_at
             FROM hydration_logs
             WHERE user_id = ?
             ORDER BY logged_at DESC
             LIMIT 50`,
            [req.session.userId]
        );

        // Calculate today's hydration total
        const [todayTotalRows] = await db.query(
            `SELECT COALESCE(SUM(amount_ml), 0) AS total_ml
             FROM hydration_logs
             WHERE user_id = ? AND logged_at = CURDATE()`,
            [req.session.userId]
        );

        const todayHydrationTotal = todayTotalRows.length ? todayTotalRows[0].total_ml : 0;

        // Calories per day (last 7 days)
        const [calorieChartRows] = await db.query(
            `SELECT DATE(logged_at) AS day, SUM(calories) AS total_calories
             FROM diet_logs
             WHERE user_id = ? AND calories IS NOT NULL
             GROUP BY DATE(logged_at)
             ORDER BY day DESC
             LIMIT 7`,
            [req.session.userId]
        );

        // Hydration per day (last 7 days)
        const [hydrationChartRows] = await db.query(
            `SELECT logged_at AS day, SUM(amount_ml) AS total_ml
             FROM hydration_logs
             WHERE user_id = ?
             GROUP BY logged_at
             ORDER BY day DESC
             LIMIT 7`,
            [req.session.userId]
        );

        res.render('diet', {
            foodLogs: foodRows,
            hydrationLogs: hydrationRows,
            todayHydrationTotal,
            calorieChartData: calorieChartRows.reverse(),
            hydrationChartData: hydrationChartRows.reverse(),
            session: req.session
        });

    } catch (error) {
        console.error(error);
        res.send("Something went wrong while loading the diet page.");
    }
});

// Show add form (food + hydration in one page)
router.get('/diet/add', (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    res.render('diet_add', { session: req.session });
});

// Handle adding a FOOD log
router.post('/diet/add-food', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    const { meal_type, food_name, calories, notes, logged_at } = req.body;

    try {
        await db.query(
            `INSERT INTO diet_logs (user_id, meal_type, food_name, calories, notes, logged_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                req.session.userId,
                meal_type,
                food_name,
                calories ? Number(calories) : null,
                notes || null,
                logged_at ? new Date(logged_at) : new Date()
            ]
        );

        res.redirect('/usr/455/diet');

    } catch (error) {
        console.error(error);
        res.send("Something went wrong while saving the food log.");
    }
});

// Handle adding a HYDRATION log
router.post('/diet/add-hydration', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    const { amount_ml, logged_date } = req.body;

    try {
        await db.query(
            `INSERT INTO hydration_logs (user_id, amount_ml, logged_at)
             VALUES (?, ?, ?)`,
            [
                req.session.userId,
                Number(amount_ml),
                logged_date
            ]
        );

        res.redirect('/usr/455/diet');

    } catch (error) {
        console.error(error);
        res.send("Something went wrong while saving hydration.");
    }
});

// Delete a FOOD log
router.delete('/diet/delete-food/:id', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    try {
        await db.query(
            `DELETE FROM diet_logs WHERE id = ? AND user_id = ?`,
            [req.params.id, req.session.userId]
        );

        res.redirect('/usr/455/diet');

    } catch (error) {
        console.error(error);
        res.send("Something went wrong deleting the food log.");
    }
});

// Delete a HYDRATION log
router.delete('/diet/delete-hydration/:id', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    try {
        await db.query(
            `DELETE FROM hydration_logs WHERE id = ? AND user_id = ?`,
            [req.params.id, req.session.userId]
        );

        res.redirect('/usr/455/diet');

    } catch (error) {
        console.error(error);
        res.send("Something went wrong deleting the hydration log.");
    }
});

module.exports = router;

