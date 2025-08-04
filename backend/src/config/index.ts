import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // API Keys
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  tomorrowIoApiKey: process.env.TOMORROW_IO_API_KEY || '',
  planetApiKey: process.env.PLANET_API_KEY || '',
  
  // Twilio Configuration
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  },
  
  // Firebase Configuration
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
  },
  
  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  
  // Database Configuration
  databaseUrl: process.env.DATABASE_URL || '',
  
  // Redis Configuration
  redisUrl: process.env.REDIS_URL || '',
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  
  // CORS Configuration
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Cache Configuration
  cache: {
    ttl: 300, // 5 minutes default
    checkPeriod: 600, // 10 minutes
  },
  
  // File Upload Configuration
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    uploadDir: './uploads',
  },
} as const;

export type Config = typeof config;