import express, { Express } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import config from './config';
import { Logger, FileSystemHelper } from './utils/helpers';
import { authMiddleware, errorHandler } from './middleware/auth';
import { ProviderFactory } from './providers/ProviderFactory';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import generationRoutes from './routes/generation';

const app: Express = express();
const logger = Logger.getInstance();
const prisma = new PrismaClient();

// Ensure uploads directory exists
FileSystemHelper.ensureDirectoryExists(config.uploadDir);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', authMiddleware, projectRoutes);
app.use('/api/generation', authMiddleware, generationRoutes);

// Error handler
app.use(errorHandler);

// Initialize app
async function initialize() {
  try {
    logger.info('Initializing AI Video Creator Backend');
    logger.info(`Environment: ${config.nodeEnv}`);
    logger.info(`Port: ${config.port}`);
    logger.info(`Database: ${config.databaseUrl.substring(0, 30)}...`);

    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');

    // Initialize providers
    await ProviderFactory.initialize();

    // Start server
    app.listen(config.port, () => {
      logger.info(`✓ Server running on http://localhost:${config.port}`);
      logger.info('✓ Ready for API requests');
    });
  } catch (error) {
    logger.error('Failed to initialize application', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

initialize();

export { app, prisma };
