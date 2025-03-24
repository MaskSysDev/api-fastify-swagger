import { env } from '#utils/env.js';
import { pino } from 'pino';

export const logger = pino({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  redact: ['DATABASE_URL', 'AUTH_SECRET'],
  timestamp: true,
  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'SYS:standard',
          },
        }
      : undefined,
});

process.on('warning', (warning) => {
  logger.warn(warning);
});
