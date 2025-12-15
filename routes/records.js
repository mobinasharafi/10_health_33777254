// This file contains all routes related to health records.
// It allows the user to view their records and add new ones.

const express = require('express');
const router = express.Router();
const db = require('../config/db');


// Show the list of records for the user
router.get('/', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect('../login');
        }

        const sortOption = req.query.sort || "date_desc";
        let orderBy = "created_at DESC";

        if (sortOption === "date_asc") {
            orderBy = "created_at ASC";
        } else if (sortOption === "duration") {
            orderBy = "duration DESC";
        } else if (sortOption === "calories") {
            orderBy = "calories_burnt DESC";
        } else if (sortOption === "activity") {
            orderBy = "activity ASC";
        }

        const [rows] = await db.query(
            `SELECT * FROM records WHERE user_id = ? ORDER BY ${orderBy}`,
            [req.session.userId]
        );

        res.render('records', { records: rows, sort: sortOption });

    } catch (error) {
        console.error(error);
        res.send("Something went wrong");
    }
});


// Showing the "Add Record" form
router.get('/add', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('../login');
    }
    res.render('add_record');
});


// Handle form submission to add a new record
router.post('/add', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect('../login');
        }

        const { activity, duration, calories_burnt, intensity } = req.body;

        await db.query(
            "INSERT INTO records (user_id, activity, duration, calories_burnt, intensity, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
            [
                req.session.userId,
                activity,
                duration,
                calories_burnt || null,
                intensity || null
            ]
        );

        res.redirect('/records');

    } catch (error) {
        console.error(error);
        res.send("Something went wrong");
    }
});


// Show the edit form for a specific record
router.get('/edit/:id', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect('../login');
        }

        const recordId = req.params.id;

        const [rows] = await db.query(
            "SELECT * FROM records WHERE id = ? AND user_id = ?",
            [recordId, req.session.userId]
        );

        if (rows.length === 0) {
            return res.redirect('/records');
        }

        res.render('edit_record', { record: rows[0] });

    } catch (error) {
        console.error(error);
        res.send("Something went wrong");
    }
});


// Handle saving the edited record
router.put('/edit/:id', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect('../login');
        }

        const recordId = req.params.id;
        const { activity, duration, calories_burnt, intensity } = req.body;

        await db.query(
            "UPDATE records SET activity = ?, duration = ?, calories_burnt = ?, intensity = ? WHERE id = ? AND user_id = ?",
            [
                activity,
                duration,
                calories_burnt || null,
                intensity || null,
                recordId,
                req.session.userId
            ]
        );

        res.redirect('/records');

    } catch (error) {
        console.error(error);
        res.send("Something went wrong");
    }
});


// Search for health records
router.get('/search', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect('../login');
        }

        const searchTerm = req.query.q;

        const [rows] = await db.query(
            "SELECT * FROM records WHERE user_id = ? AND activity LIKE CONCAT('%', ?, '%') ORDER BY created_at DESC",
            [req.session.userId, searchTerm]
        );

        res.render('records', { records: rows, sort: "date_desc" });

    } catch (error) {
        console.error(error);
        res.send("Something went wrong");
    }
});


// Delete a record
router.delete('/delete/:id', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect('../login');
        }

        const recordId = req.params.id;

        await db.query(
            "DELETE FROM records WHERE id = ? AND user_id = ?",
            [recordId, req.session.userId]
        );

        res.redirect('/records');

    } catch (error) {
        console.error(error);
        res.send("Something went wrong");
    }
});


// Suggest activities for autocomplete
router.get('/suggest', async (req, res) => {
    if (!req.session.userId) return res.json([]);

    const q = req.query.q || '';
    if (q.length < 1) return res.json([]);

    const [rows] = await db.query(
        "SELECT DISTINCT activity FROM records WHERE user_id = ? AND activity LIKE CONCAT('%', ?, '%') LIMIT 5",
        [req.session.userId, q]
    );

    res.json(rows.map(r => r.activity));
});


module.exports = router;