// This file creates a connection to the mysql database.
// The objective is keeping all database setup in one place,

// We use "mysql2" because it supports modern features like promises and async/await.
const mysql = require('mysql2');

// we load the database connection details from environment variables/
require('dotenv').config();

// Here we create a function that sets up a connection pool.
// It can handle multiple requests at the same time without crashing.
const pool = mysql.createPool({
    host: process.env.HEALTH_HOST,    
    user: process.env.HEALTH_USER,      
    password: process.env.HEALTH_PASSWORD,
    database: process.env.HEALTH_DATABASE
});

// We use ".promise()" so we can use async/await in our code.
// This makes working with the database much easier to read and write.
const db = pool.promise();

// We export this database object so other files can use it.
module.exports = db;