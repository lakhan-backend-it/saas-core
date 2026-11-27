import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { env } from './config/env';
import { requestIdMiddleware } from './common/middleware/request-id.middleware';
import { requestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import { rateLimitMiddleware } from './infrastructure/security/rate-limit';
import { notFoundHandler } from './common/middleware/not-found.middleware';
import { errorHandler } from './common/middleware/error-handler.middleware';
import { registerRoutes } from './routes';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  // ── Security & transport ──────────────────────────────────────────
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        const allowed = env.CORS_ORIGINS;
        if (allowed.includes('*') || allowed.includes(origin)) {
          return callback(null, true);
        }
        // Allow Vercel production + preview hosts when any *.vercel.app is listed
        try {
          const host = new URL(origin).hostname;
          if (
            host.endsWith('.vercel.app') &&
            allowed.some((o) => o.includes('vercel.app'))
          ) {
            return callback(null, true);
          }
        } catch {
          /* ignore */
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
    })
  );
  app.use(rateLimitMiddleware);
  app.use(compression());

  // ── Body parsing (bounded) ────────────────────────────────────────
  app.use(express.json({ limit: '6mb' }));
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));

  // ── Observability ─────────────────────────────────────────────────
  app.use(requestIdMiddleware);
  app.use(requestLoggerMiddleware);

  // Static uploads (local storage driver)
  app.use('/uploads', express.static('uploads'));

  // ── API ───────────────────────────────────────────────────────────
  registerRoutes(app);

  // ── Error boundary (must be last) ─────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
