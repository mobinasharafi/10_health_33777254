// This file contains all routes related to the Vision Board feature.
// Users can write their vision statement and upload inspirational images.

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const path = require('path');
const multer = require('multer');

// Multer handles image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// Display vision board
router.get('/vision', async (req, res) => {
    if (!req.session.userId) return res.redirect('login');

    const [visionRows] = await db.query(
        "SELECT vision_text FROM vision WHERE user_id = ?",
        [req.session.userId]
    );

    const [imageRows] = await db.query(
        "SELECT id, filename FROM vision_images WHERE user_id = ? ORDER BY created_at DESC",
        [req.session.userId]
    );

    res.render('vision', {
        visionText: visionRows.length ? visionRows[0].vision_text : "",
        images: imageRows,
        session: req.session
    });
});


// Update vision text
router.post('/vision/update', async (req, res) => {
    if (!req.session.userId) return res.redirect('login');

    await db.query(
        "UPDATE vision SET vision_text = ? WHERE user_id = ?",
        [req.body.vision_text, req.session.userId]
    );

    // Redirect back to vision page without leaving /usr/455
    res.redirect('vision');
});


// Upload image
router.post('/vision/upload', upload.single('vision_image'), async (req, res) => {
    if (!req.session.userId) return res.redirect('login');

    await db.query(
        "INSERT INTO vision_images (user_id, filename) VALUES (?, ?)",
        [req.session.userId, req.file.filename]
    );

    res.redirect('vision');
});


// Delete image
router.delete('/vision/delete-image/:id', async (req, res) => {
    if (!req.session.userId) return res.redirect('login');

    await db.query(
        "DELETE FROM vision_images WHERE id = ? AND user_id = ?",
        [req.params.id, req.session.userId]
    );

    res.redirect('vision');
});

module.exports = router;
