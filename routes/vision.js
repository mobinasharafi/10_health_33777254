// This file contains all routes related to the Vision Board feature.
// Users can write their vision statement and upload inspirational images.

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const path = require('path');

// Multer handles image uploads
const multer = require('multer');

// Storage setup for vision board images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    cb(null, allowed.includes(file.mimetype));
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Display vision board
router.get('/vision', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    try {
        const [visionRows] = await db.query(
            "SELECT vision_text FROM vision WHERE user_id = ?",
            [req.session.userId]
        );

        const [imageRows] = await db.query(
            "SELECT id, filename FROM vision_images WHERE user_id = ? ORDER BY created_at DESC",
            [req.session.userId]
        );

        const visionText = visionRows.length ? visionRows[0].vision_text : "";

        res.render('vision', {
            visionText,
            images: imageRows,
            session: req.session
        });

    } catch (error) {
        console.error(error);
        res.send("Something went wrong while loading the vision board.");
    }
});

// Save or update vision text
router.post('/vision', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    const { vision_text } = req.body;

    try {
        const [existing] = await db.query(
            "SELECT id FROM vision WHERE user_id = ?",
            [req.session.userId]
        );

        if (existing.length > 0) {
            await db.query(
                "UPDATE vision SET vision_text = ? WHERE user_id = ?",
                [vision_text, req.session.userId]
            );
        } else {
            await db.query(
                "INSERT INTO vision (user_id, vision_text) VALUES (?, ?)",
                [req.session.userId, vision_text]
            );
        }

        res.redirect('/vision');
    } catch (error) {
        console.error(error);
        res.send("Something went wrong while saving the vision.");
    }
});

// Edit vision (shows write box again)
router.get('/vision/edit', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    const [rows] = await db.query(
        "SELECT vision_text FROM vision WHERE user_id = ?",
        [req.session.userId]
    );

    const visionText = rows.length ? rows[0].vision_text : "";

    res.render('vision_edit', { visionText, session: req.session });
});

// ✅ MISSING ROUTE ADDED — handles updating edited vision
router.post('/vision/update', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    const { vision_text } = req.body;

    try {
        await db.query(
            "UPDATE vision SET vision_text = ? WHERE user_id = ?",
            [vision_text, req.session.userId]
        );

        res.redirect('/usr/455/vision');

    } catch (error) {
        console.error(error);
        res.send("Something went wrong while updating your vision.");
    }
});

// Handle image upload
router.post('/vision/upload', upload.single('vision_image'), async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    try {
        if (!req.file) return res.send("Invalid image file.");

        await db.query(
            "INSERT INTO vision_images (user_id, filename) VALUES (?, ?)",
            [req.session.userId, req.file.filename]
        );

        res.redirect('/vision');

    } catch (error) {
        console.error(error);
        res.send("Something went wrong uploading your image.");
    }
});

// Delete an image from vision board
router.delete('/vision/delete-image/:id', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    try {
        await db.query(
            "DELETE FROM vision_images WHERE id = ? AND user_id = ?",
            [req.params.id, req.session.userId]
        );

        res.redirect('/vision');

    } catch (error) {
        console.error(error);
        res.send("Something went wrong deleting your image.");
    }
});

module.exports = router;
