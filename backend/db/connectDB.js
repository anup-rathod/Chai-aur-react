const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = async () => {
    try {
        const connectionString = "mongodb+srv://anuprathod2712:Password1@cluster0.x4ktl.mongodb.net";
        if (!connectionString) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        const connectionInstance = await mongoose.connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB connected !! DB Host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error('MongoDB connection FAILED', error);
        process.exit(1);
    }
};

module.exports = connectDB;
