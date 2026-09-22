const mongoose = require('mongoose');

// Function responsible for connecting to your MongoDB database instance
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/digital_banking_db');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1); // Stop server process if database fails to connect
  }
};

module.exports = connectDB;