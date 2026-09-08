import createApp from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { prisma } from './config/database';

const app = createApp();

const server = app.listen(config.port, () => {
  logger.info(`========================================================`);
  logger.info(`SADAK SETU BACKEND ENGINE ONLINE`);
  logger.info(`Environment: ${config.env}`);
  logger.info(`Listening on Port: ${config.port}`);
  logger.info(`API Base URL: http://localhost:${config.port}${config.apiPrefix}`);
  logger.info(`API Documentation: http://localhost:${config.port}/api/docs`);
  logger.info(`Health Endpoint: http://localhost:${config.port}/health`);
  logger.info(`AI Integration Mode: ${config.ai.mode.toUpperCase()}`);
  logger.info(`IoT Telemetry Mode: ${config.iot.mode.toUpperCase()}`);
  logger.info(`========================================================`);
});

// Graceful Shutdown Handler
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Gracefully terminating backend server...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    await prisma.$disconnect();
    logger.info('Database connections closed.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forcefully terminating process due to shutdown timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
