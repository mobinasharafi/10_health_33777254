// Load environment variables from .env
require('dotenv').config();

// Import required libraries
const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

// Import database connection
const db = require('./config/db');

// Create Express app
const app = express();

// App port
const PORT = 8000;

// Middleware to parse form and JSON data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Allow PUT/DELETE via forms
app.use(methodOverride('_method'));

// Serve static files (CSS, images, client JS)
app.use(express.static(path.join(__dirname, 'public')));

// Session setup
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));

// Make session available in all EJS views
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Redirect root to /home
app.get('/', (req, res) => {
    res.redirect('/home');
});

// Home route
app.get('/home', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.render('home', { user: null });
        }

        const [rows] = await db.query(
            "SELECT first_name, last_name, age, height_cm, weight_kg, bmi, goal FROM users WHERE id = ?",
            [req.session.userId]
        );

        const user = rows.length > 0 ? rows[0] : null;
        res.render('home', { user });

    } catch (error) {
        console.error(error);
        res.render('home', { user: null });
    }
});

// About route
app.get('/about', (req, res) => {
    res.render('about');
});

// Other route imports

const authRoutes = require('./routes/auth');
app.use(authRoutes);

const recordRoutes = require('./routes/records');
app.use(recordRoutes);

const visionRoutes = require('./routes/vision');
app.use(visionRoutes);

const wellnessRoutes = require('./routes/wellness');
app.use(wellnessRoutes);

const dietRoutes = require('./routes/diet');
app.use(dietRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`HTTP server listening on port ${PORT}`);
});
