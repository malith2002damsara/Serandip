import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Check if already connected
    if (mongoose.connections[0].readyState) {
      console.log('MongoDB already connected');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Don't exit process in serverless environment
    throw error;
  }
};

export default connectDB;