import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://user:password@localhost:3005/ai_video_creator',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // File Storage
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600', 10), // 100MB
  
  // AI Provider APIs
  kling: {
    apiKey: process.env.KLING_API_KEY || '',
    baseUrl: process.env.KLING_API_BASE_URL || 'https://api.klingai.com/v1',
  },
  
  // Job Queue
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    enabled: process.env.ENABLE_REDIS === 'true',
  },
  
  // Pricing
  pricing: {
    initialUserCredits: parseInt(process.env.INITIAL_USER_CREDITS || '50', 10),
    videoGeneration: {
      5: parseInt(process.env.VIDEO_GENERATION_COST_5S || '10', 10),
      10: parseInt(process.env.VIDEO_GENERATION_COST_10S || '15', 10),
      15: parseInt(process.env.VIDEO_GENERATION_COST_15S || '20', 10),
    } as Record<number, number>,
    audioGeneration: parseInt(process.env.AUDIO_GENERATION_COST || '5', 10),
  },
};

export default config;
