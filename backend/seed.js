require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function seedAdminUser() {
    const adminUser = {
        fname: 'suliman',
        lname: 'y',
        username: 'sull',
        email: 'sull@sull.com',
        phone_number: '0512121212',
        password: '123123123',
        role: 'admin',
    };

    try {
        await pool.connect();
        console.log('Connected to PostgreSQL database for seeding.');

        const hashedPassword = await bcrypt.hash(adminUser.password, 10);

        const result = await pool.query(
            'INSERT INTO users(fname, lname, username, email, phone_number, password, role) VALUES($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (username) DO NOTHING RETURNING id, username, email, role',
            [adminUser.fname, adminUser.lname, adminUser.username, adminUser.email, adminUser.phone_number, hashedPassword, adminUser.role]
        );

        if (result.rows.length > 0) {
            console.log('Admin user created successfully:', result.rows[0]);
        } else {
            console.log('Admin user already exists (username conflict).');
        }
    } catch (err) {
        console.error('Error seeding admin user:', err);
    } finally {
        await pool.end();
        console.log('Database connection closed.');
    }
}

seedAdminUser();
