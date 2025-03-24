import { env } from '#utils/env.js';
import { logger } from '#utils/logger.js';
import { buildServer } from '#utils/server.js';

async function gracefulShutdown({
  app,
}: {
  app: Awaited<ReturnType<typeof buildServer>>;
}) {
  try {
    await app.close();
    logger.info('Server closed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
}

async function startServer() {
  const app = await buildServer();
  const port = env.PORT;
  const host = env.HOST;

  try {
    await app.listen({ port, host });
    logger.info(`Server running at http://localhost:${port}`);
    logger.info(`API documentation available at http://localhost:${port}/docs`);
    return app;
  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
}

async function main() {
  try {
    const app = await startServer();

    const signals = ['SIGINT', 'SIGTERM'];
    for (const signal of signals) {
      process.on(signal, async () => {
        logger.info(`Received ${signal} signal`);
        await gracefulShutdown({ app });
      });
    }

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown({ app });
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown({ app });
    });
  } catch (error) {
    logger.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
