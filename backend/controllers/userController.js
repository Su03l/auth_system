const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, fname, lname, username, email, phone_number, role, created_at, updated_at FROM users WHERE deleted_at IS NULL');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error retrieving users' });
    }
};

const getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('SELECT id, fname, lname, username, email, phone_number, role, created_at, updated_at FROM users WHERE id = $1 AND deleted_at IS NULL', [id]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (req.user.role === 'admin' || req.user.id === user.id) {
            res.status(200).json(user);
        } else {
            res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error retrieving user' });
    }
};

const getUserByUsername = async (req, res) => {
    const { username } = req.params;

    try {
        const result = await pool.query('SELECT id, fname, lname, username, email, phone_number, role, created_at, updated_at FROM users WHERE username = $1 AND deleted_at IS NULL', [username]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (req.user.role === 'admin' || req.user.username === user.username) {
            res.status(200).json(user);
        } else {
            res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error retrieving user' });
    }
};

const getMe = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT ' +
            'u.id, u.fname, u.lname, u.username, u.email, u.phone_number, u.role, u.created_at, u.updated_at, ' +
            'up.job_title, up.department, up.city, up.educational_qualification, up.about_me, up.date_of_birth ' +
            'FROM users u ' +
            'LEFT JOIN user_profiles up ON u.id = up.user_id ' +
            'WHERE u.id = $1 AND u.deleted_at IS NULL',
            [req.user.id]
        );
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error retrieving user profile' });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { fname, lname, username, email, phone_number, password, role, jobTitle, department, city, educationalQualification, aboutMe, dateOfBirth } = req.body;

    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Update users table
            let userUpdateQuery = 'UPDATE users SET updated_at = CURRENT_TIMESTAMP';
            const userQueryParams = [id];
            let userParamIndex = 2;

            if (fname) { userUpdateQuery += `, fname = $${userParamIndex++}`; userQueryParams.push(fname); }
            if (lname) { userUpdateQuery += `, lname = $${userParamIndex++}`; userQueryParams.push(lname); }
            if (username) { userUpdateQuery += `, username = $${userParamIndex++}`; userQueryParams.push(username); }
            if (email) { userUpdateQuery += `, email = $${userParamIndex++}`; userQueryParams.push(email); }
            if (phone_number) { userUpdateQuery += `, phone_number = $${userParamIndex++}`; userQueryParams.push(phone_number); }
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                userUpdateQuery += `, password = $${userParamIndex++}`; userQueryParams.push(hashedPassword);
            }
            if (role && req.user.role === 'admin') { userUpdateQuery += `, role = $${userParamIndex++}`; userQueryParams.push(role); }

            userUpdateQuery += ' WHERE id = $1 AND deleted_at IS NULL RETURNING id, fname, lname, username, email, phone_number, role, created_at, updated_at';

            const userToUpdateResult = await client.query('SELECT id, role FROM users WHERE id = $1 AND deleted_at IS NULL', [id]);
            const userToUpdate = userToUpdateResult.rows[0];

            if (!userToUpdate) {
                await client.query('ROLLBACK');
                return res.status(404).json({ message: 'User not found' });
            }

            if (req.user.role === 'admin' || req.user.id === userToUpdate.id) {
                if (role && req.user.role !== 'admin') {
                    await client.query('ROLLBACK');
                    return res.status(403).json({ message: 'Forbidden: Only admins can change roles' });
                }
                const updatedUserResult = await client.query(userUpdateQuery, userQueryParams);

                // Update user_profiles table
                let profileUpdateQuery = 'UPDATE user_profiles SET updated_at = CURRENT_TIMESTAMP';
                const profileQueryParams = [id];
                let profileParamIndex = 2;

                if (jobTitle) { profileUpdateQuery += `, job_title = $${profileParamIndex++}`; profileQueryParams.push(jobTitle); }
                if (department) { profileUpdateQuery += `, department = $${profileParamIndex++}`; profileQueryParams.push(department); }
                if (city) { profileUpdateQuery += `, city = $${profileParamIndex++}`; profileQueryParams.push(city); }
                if (educationalQualification) { profileUpdateQuery += `, educational_qualification = $${profileParamIndex++}`; profileQueryParams.push(educationalQualification); }
                if (aboutMe) { profileUpdateQuery += `, about_me = $${profileParamIndex++}`; profileQueryParams.push(aboutMe); }
                if (dateOfBirth) { profileUpdateQuery += `, date_of_birth = $${profileParamIndex++}`; profileQueryParams.push(dateOfBirth); }

                profileUpdateQuery += ' WHERE user_id = $1';

                const profileResult = await client.query('SELECT user_id FROM user_profiles WHERE user_id = $1', [id]);
                if (profileResult.rows.length > 0) {
                    await client.query(profileUpdateQuery, profileQueryParams);
                } else if (jobTitle || department || city || educationalQualification || aboutMe || dateOfBirth) {
                    // If no profile exists, create one with the provided data
                    await client.query(
                        'INSERT INTO user_profiles(user_id, job_title, department, city, educational_qualification, about_me, date_of_birth) VALUES($1, $2, $3, $4, $5, $6, $7)',
                        [id, jobTitle, department, city, educationalQualification, aboutMe, dateOfBirth]
                    );
                }

                await client.query('COMMIT');
                res.status(200).json({ message: 'User and profile updated successfully', user: updatedUserResult.rows[0] });
            } else {
                await client.query('ROLLBACK');
                res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
            }
        } catch (transactionError) {
            await client.query('ROLLBACK');
            throw transactionError;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error updating user' });
    }
};

const changePassword = async (req, res) => {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    try {
        const result = await pool.query('SELECT id, password, role FROM users WHERE id = $1 AND deleted_at IS NULL', [id]);
        const userToUpdate = result.rows[0];

        if (!userToUpdate) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (req.user.role !== 'admin' && req.user.id !== userToUpdate.id) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }

        if (req.user.id === userToUpdate.id) {
            if (!oldPassword) {
                return res.status(400).json({ message: 'Old password is required to change your own password' });
            }
            const passwordMatch = await bcrypt.compare(oldPassword, userToUpdate.password);
            if (!passwordMatch) {
                return res.status(403).json({ message: 'Incorrect old password' });
            }
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [hashedNewPassword, id]);

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error changing password' });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error deleting user' });
    }
};

const setAdmin = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('UPDATE users SET role = \'admin\', updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL RETURNING id, username, email, role', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User role updated to admin', user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error setting user as admin' });
    }
};

module.exports = { getAllUsers, getUserById, getUserByUsername, getMe, updateUser, changePassword, deleteUser, setAdmin };
