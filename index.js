// This line loads the values from the .env file into our project.
require('dotenv').config();
// We import all the libraries we need for our web application.
const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
// We import the database connection so we can load user details for the home page.
const db = require('./config/db');

// Here we create the main object that controls our web application, defined as "app".
const app = express();

// The lab instructs that the app should run on 8000 per usual, it's followed here.
const PORT = 8000;

// This lets our app read the information people send in forms or as JSON data.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// this allows us to use HTTP verbs such as PUT or DELETE in places where the client doesn't support it.
app.use(methodOverride('_method'));

// This line tells the app where to find static files like CSS, images, and client-side JavaScript.
app.use(express.static(path.join(__dirname, 'public')));

// This part sets up sessions, so the app can know who the user is.
// For example: a logged-in user stays logged in when they move between pages.
app.use(session({
    // This secret protects the session data. It should always come from the .env file.
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));

// Making the session available in all EJS views so we can check if the user is logged in.
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// Load log in routes
const authRoutes = require('./routes/auth');
app.use(authRoutes);

// Load health records routes
const recordRoutes = require('./routes/records');
app.use(recordRoutes);

// Load vision board routes (writing and viewing the user's health vision)
const visionRoutes = require('./routes/vision');
app.use(visionRoutes);

// Load wellness check routes (quick health and wellness questionnaires)
const wellnessRoutes = require('./routes/wellness');
app.use(wellnessRoutes);

// Load diet explorer routes (diet suggestions based on goal, BMI, preferences)
const dietRoutes = require('./routes/diet');
app.use(dietRoutes);

// view engine setup:
app.set('view engine', 'ejs');

// define where the template files are located:
app.set('views', path.join(__dirname, 'views'));

// These are the routes for our web application. home page and about page.
app.get('/', async (req, res) => {
    try {
        // If the user is not logged in, we just show the normal home page without profile details.
        if (!req.session.userId) {
            return res.render('home', { user: null });
        }

        // If a user is logged in, we fetch their profile information from the database.
        const [rows] = await db.query(
            "SELECT first_name, last_name, age, height_cm, weight_kg, bmi, goal FROM users WHERE id = ?",
            [req.session.userId]
        );

        // If we found the user, we pass their data to the home page. Otherwise we pass null.
        const user = rows.length > 0 ? rows[0] : null;

        res.render('home', { user });

    } catch (error) {
        console.error(error);
        // If something goes wrong, we still show the home page, just without user information.
        res.render('home', { user: null });
    }
});

app.get('/about', (req, res) => {
    res.render('about');
});

// Start the web server and listen on the specified port.
app.listen(PORT, () => {
    console.log(`HTTP server listening on port ${PORT}`);
});
