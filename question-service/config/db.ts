import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const mongodbURI = process.env.MONGODB_URI || ''; // Fetch MongoDB URI from .env
    if (!mongodbURI) {
      throw new Error('MongoDB URI not found');
    }

    await mongoose.connect(mongodbURI);

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
