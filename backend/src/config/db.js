const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB] Warning: Could not connect to MongoDB (${error.message}).`);
    console.warn(`[MongoDB] Running in offline/in-memory mode for analysis. Reports and user persistence require MongoDB.`);
  }
};

module.exports = connectDB;
