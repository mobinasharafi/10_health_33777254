// This file contains all routes related to health records.
// It allows the user to view their records and add new ones.

const express = require('express');
const router = express.Router();
const db = require('../config/db');


// Show the list of records for the user
router.get('/records', async (req, res) => {
    try {
        // If the user is not logged in, send them back to the login page
        if (!req.session.userId) {
            return res.redirect('login');
        }

        // Determine sorting method chosen by the user
        // Default: newest first
        const sortOption = req.query.sort || "date_desc";

        // SQL ORDER BY logic depending on selection
        let orderBy = "created_at DESC"; // default

        if (sortOption === "date_asc") {
            orderBy = "created_at ASC";
        } else if (sortOption === "duration") {
            orderBy = "duration DESC";
        } else if (sortOption === "calories") {
            orderBy = "calories_burnt DESC";
        } else if (sortOption === "activity") {
            orderBy = "activity ASC";
        }

        // Select all records that belong to the logged-in user, sorted properly
        const [rows] = await db.query(
            `SELECT * FROM records WHERE user_id = ? ORDER BY ${orderBy}`,
            [req.session.userId]
        );

        // Show the page, include the sorting option so EJS can highlight the active choice
        res.render('records', { records: rows, sort: sortOption });

    } catch (error) {
        console.error(error);
        res.send("Something went wrong");
    }
});


// Showing the "Add Record" form
router.get('/records/add', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('login');
    }
    res.render('add_record');
});


// Handle form submission to add a new record
router.post('/records/add', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect('login');
        }

        // Read the values from the form given by the user
        const { activity, duration, calories_burnt, intensity } = req.body;

        // Insert a new record into the database
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

        // Redirect back to records list without leaving the VM base path
        res.redirect('records');

    } catch (error) {
        console.error(error);
        res.send("Something went wrong");
    }
});


// Show the edit form for a specific record
router.get('/records/edit/:id', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect('login');
        }

        const recordId = req.params.id;

        // Find the specific record in our database
        const [rows] = await db.query(
            "SELECT * FROM records WHERE id = ? AND user_id = ?",
            [recordId, req.session.userId]
        );

        // If no record found, redirect to records list
        if (rows.length === 0) {
            return res.redirect('../records');
        }

        const record = rows[0];
        res.render('edit_record', { record });

    } catch (error) {
        console.error(error);
        res.send("Something went wrong");
    }
});


// Handle saving the edited record (PUT)
router.put('/records/edit/:id', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect('login');
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

        // Redirect back to records list without leaving the VM base path
        res.redirect('../records');

    } catch (error) {
        console.error(error);
        res.send("Something went wrong");
    }
});


// Delete a record
router.delete('/records/delete/:id', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect('login');
        }

        const recordId = req.params.id;

        await db.query(
            "DELETE FROM records WHERE id = ? AND user_id = ?",
            [recordId, req.session.userId]
        );

        // Redirect back to records list without leaving the VM base path
        res.redirect('../records');

    } catch (error) {
        console.error(error);
        res.send("Something went wrong");
    }
});

module.exports = router;
