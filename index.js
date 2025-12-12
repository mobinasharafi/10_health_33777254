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

// The lab instructs that the app should run on 8000 per usual.
const PORT = 8000;

// 🔹 IMPORTANT: base path for university VM deployment
const BASE_PATH = '/usr/455';

// This lets our app read the information people send in forms or as JSON data.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// this allows us to use HTTP verbs such as PUT or DELETE in places where the client doesn't support it.
app.use(methodOverride('_method'));

// This line tells the app where to find static files like CSS, images, and client-side JavaScript.
app.use(BASE_PATH, express.static(path.join(__dirname, 'public')));

// This part sets up sessions, so the app can know who the user is.
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));

// Making the session available in all EJS views so we can check if the user is logged in.
app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.basePath = BASE_PATH; // useful in views if needed
    next();
});

// view engine setup:
app.set('view engine', 'ejs');

// define where the template files are located:
app.set('views', path.join(__dirname, 'views'));

// Load routes
const authRoutes = require('./routes/auth');
const recordRoutes = require('./routes/records');
const visionRoutes = require('./routes/vision');

// 🔹 Mount ALL routes under the base path
app.use(BASE_PATH, authRoutes);
app.use(BASE_PATH, recordRoutes);
app.use(BASE_PATH, visionRoutes);

// Home page
app.get(BASE_PATH + '/', async (req, res) => {
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
        res.render('home', { user: null });
    }
});

// About page
app.get(BASE_PATH + '/about', (req, res) => {
    res.render('about');
});

// Start the web server and listen on the specified port.
app.listen(PORT, () => {
    console.log(`HTTP server listening on port ${PORT}`);
});
