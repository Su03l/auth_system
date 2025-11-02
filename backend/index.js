require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Import cors

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./middleware/auth');
const authorize = require('./middleware/authorize');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerConfig');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const forgotPasswordRoutes = require('./routes/forgotPassword');
const requestLogger = require('./middleware/requestLogger');

const app = express();
app.use(express.json());
app.use(requestLogger);

// Configure CORS to allow requests from your frontend
app.use(cors({ origin: 'http://localhost:3000' }));

// Serve Swagger UI
app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Use API routes
app.use('/auth', authRoutes);
app.use('/auth', forgotPasswordRoutes);
app.use('/users', userRoutes);



app.get('/', (req, res) => {
    res.send('<h1>server is running</h1> <a href="/api" > api docs </a>');

});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
