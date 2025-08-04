import mongoose from 'mongoose';
import { config } from './config/index.js';

export const connectToDatabase = async () => {
  try {
    await mongoose.connect(config.databaseUrl, {
      // These options are now default in mongoose 6+, but kept for clarity
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    console.log('MongoDB connected!');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}; 