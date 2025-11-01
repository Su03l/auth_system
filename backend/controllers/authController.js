const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const signup = async (req, res) => {
    const { fname, lname, username, email, phone_number, password, jobTitle, department, city, educationalQualification, aboutMe, dateOfBirth } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const client = await pool.connect(); // Start a transaction
        try {
            await client.query('BEGIN');
            const userResult = await client.query(
                'INSERT INTO users(fname, lname, username, email, phone_number, password, role) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id, username, email, role',
                [fname, lname, username, email, phone_number, hashedPassword, 'user']
            );
            const newUser = userResult.rows[0];

            await client.query(
                'INSERT INTO user_profiles(user_id, job_title, department, city, educational_qualification, about_me, date_of_birth) VALUES($1, $2, $3, $4, $5, $6, $7)',
                [newUser.id, jobTitle, department, city, educationalQualification, aboutMe, dateOfBirth]
            );

            await client.query('COMMIT');
            res.status(201).json({ message: 'User registered successfully', user: newUser });
        } catch (transactionError) {
            await client.query('ROLLBACK');
            throw transactionError;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error registering user' });
    }
};

const signin = async (req, res) => {
    const { loginIdentifier, password } = req.body; // loginIdentifier can be username or email

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $1', [loginIdentifier]);
        const user = result.rows[0];

        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Signed in successfully', token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error signing in' });
    }
};

const refresh = async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT verification error:', err);
            return res.status(403).json({ message: 'Invalid token' });
        }

        const newAccessToken = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Access token refreshed', accessToken: newAccessToken });
    });
};

const logout = (req, res) => {
    res.status(200).json({ message: 'Logged out successfully. Please discard your tokens.' });
};

module.exports = { signup, signin, refresh, logout };
