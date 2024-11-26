const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const connectDB = require('./db/connectDB'); // Adjust the path to where connectDB.js is located
const User = require('./models/User'); // Ensure this path is correct

// Load environment variables
dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000', // Default origin if not set
    credentials: true,
}));
app.use(bodyParser.json());

// Register endpoint for normal users
app.post('/api/register', async (req, res) => {
    const { firstName, lastName, email, phoneNumber, password } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            firstName,
            lastName,
            email,
            phoneNumber,
            password: hashedPassword
        });

        await newUser.save();

        const authToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });

        res.json({ success: true, authToken });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Register endpoint for admin users
app.post('/api/admin/register', async (req, res) => {
    const { firstName, lastName, email, phoneNumber, password, key } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber || !password || !key) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (key !== process.env.ADMIN_KEY) {
        return res.status(403).json({ error: 'Invalid admin key' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new User({
            firstName,
            lastName,
            email,
            phoneNumber,
            password: hashedPassword,
            isAdmin: true // Add a flag to distinguish admin users
        });

        await newAdmin.save();

        const authToken = jwt.sign({ id: newAdmin._id, isAdmin: true }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });

        res.json({ success: true, authToken });
    } catch (error) {
        console.error('Admin registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const authToken = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });

        res.json({ success: true, authToken });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
