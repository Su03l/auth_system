// backend/db.js
const { Pool } = require('pg');
require('dotenv').config();

// This single pool instance will be shared across the application
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL database via shared pool');
});

pool.on('error', (err) => {
    console.error('Database pool error', err);
});

module.exports = pool;
