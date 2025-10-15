import app from './app';
import { connectDatabase } from '@/config/database';
import { redisClient } from '@/config/redis';
import { config } from '@/config/config';

const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Connect to Redis (optional - won't block server start)
    try {
      await redisClient.connect();
    } catch (error) {
      console.warn('⚠️  Redis connection failed, running without cache:', error);
    }

    // Start server
    const server = app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`📚 API Documentation: http://localhost:${config.port}/docs`);
      console.log(`🏥 Health Check: http://localhost:${config.port}/health`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      await redisClient.disconnect();
      server.close(() => {
        console.log('Process terminated');
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
