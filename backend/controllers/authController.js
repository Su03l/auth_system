const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



const signup = async (req, res) => {
    const { fname, lname, username, email, phone_number, password, jobTitle, department, city, educationalQualification, aboutMe, dateOfBirth } = req.body;

    // Backend Validation
    const nameRegex = /^[A-Za-z\u0600-\u06FF\s]+$/;
    const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^05[0-9]{8}$/;

    if (!fname || !nameRegex.test(fname)) {
        return res.status(400).json({ error: 'First name must contain only letters.' });
    }
    if (!lname || !nameRegex.test(lname)) {
        return res.status(400).json({ error: 'Last name must contain only letters.' });
    }
    if (!username || !usernameRegex.test(username)) {
        return res.status(400).json({ error: 'Username can only contain letters, numbers, _, -, .' });
    }
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format.' });
    }
    if (phone_number && !phoneRegex.test(phone_number)) {
        return res.status(400).json({ error: 'Invalid phone number format. Must start with 05 and be followed by 8 digits.' });
    }
    if (!password || password.length < 4 || password.length > 16) {
        return res.status(400).json({ error: 'Password must be between 4 and 16 characters long.' });
    }

    try {
        // Check if username or email already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (existingUser.rows.length > 0) {
            const conflictUser = existingUser.rows[0];
            // Determine if the conflict is by username or email
            const usernameConflict = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
            if (usernameConflict.rows.length > 0) {
                return res.status(409).json({ error: 'Username already exists' });
            }

            const emailConflict = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
            if (emailConflict.rows.length > 0) {
                return res.status(409).json({ error: 'Email already registered' });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const client = await pool.connect(); // Start a transaction
        try {
            await client.query('BEGIN');

            // Convert empty string phone_number to null for database insertion
            const formattedPhoneNumber = phone_number === '' ? null : phone_number;

            const userResult = await client.query(
                'INSERT INTO users(fname, lname, username, email, phone_number, password, role) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id, username, email, role',
                [fname, lname, username, email, formattedPhoneNumber, hashedPassword, 'user']
            );
            const newUser = userResult.rows[0];

            // Convert empty string dateOfBirth to null, and format if not null
            let formattedDateOfBirth = null;
            if (dateOfBirth && dateOfBirth !== '') {
                try {
                    // Assuming dateOfBirth might be an ISO string or a date string that Date constructor can parse
                    const dateObj = new Date(dateOfBirth);
                    if (!isNaN(dateObj.getTime())) { // Check if date is valid
                        formattedDateOfBirth = dateObj.toISOString().split('T')[0]; // Format to YYYY-MM-DD
                    } else {
                        console.warn('Invalid dateOfBirth format received:', dateOfBirth);
                        // Optionally, handle invalid date more strictly, e.g., throw an error or set to null
                        formattedDateOfBirth = null;
                    }
                } catch (e) {
                    console.error('Error parsing dateOfBirth:', e);
                    formattedDateOfBirth = null; // Fallback to null on parsing error
                }
            }

            await client.query(
                'INSERT INTO user_profiles(user_id, job_title, department, city, educational_qualification, about_me, date_of_birth) VALUES($1, $2, $3, $4, $5, $6, $7)',
                [newUser.id, jobTitle, department, city, educationalQualification, aboutMe, formattedDateOfBirth]
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
