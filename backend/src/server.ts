import { createApp } from './app';
import { env } from './config/env';
import { logger } from './lib/logger';
import { disconnectPrisma } from './lib/prisma';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(
    { port: env.PORT, env: env.NODE_ENV },
    'API server started'
  );
});

const shutdown = async (signal: string) => {
  logger.warn({ signal }, 'Graceful shutdown initiated');
  server.close(async () => {
    await disconnectPrisma();
    logger.info('HTTP server closed');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000).unref();
};

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'Unhandled rejection');
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception');
  process.exit(1);
});
