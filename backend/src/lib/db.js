import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    // Remove deprecated options (useNewUrlParser and useUnifiedTopology)
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Recommended production options:
      maxPoolSize: 10, // Maximum number of sockets in the connection pool
      socketTimeoutMS: 30000, // Close sockets after 30 seconds of inactivity
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    });
    
    console.log(`MongoDB connected: ${conn.connection.host}`);
    
    // Event listeners for better connection monitoring
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to DB');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected');
    });

  } catch (err) {
    console.error("MongoDB initial connection error:", err);
    process.exit(1);
  }
};