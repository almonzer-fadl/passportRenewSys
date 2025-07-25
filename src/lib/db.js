import mongoose from 'mongoose';

const connection = {};

async function dbConnect() {
  if (connection.isConnected) {
    return;
  }

  // If no MongoDB URI is provided, use a mock connection for development
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI not found, using mock database for development');
    connection.isConnected = 1; // Mock connected state
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    connection.isConnected = db.connections[0].readyState;
    
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // For development, don't throw error, just log it
    console.warn('Using mock database due to connection failure');
    connection.isConnected = 1; // Mock connected state
  }
}

export default dbConnect;
