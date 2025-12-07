import express, { Application, Request, Response } from 'express';
import { getConfig } from './config';
import requestLogger from './middlewares/requestLogger';
import errorHandler from './middlewares/errorHandler';
import Logger from '../infrastructure/logging/Logger';

export function createApp(): Application {
  const app = express();
  const config = getConfig();

  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: false }));

  // Attach request logger early
  app.use(requestLogger);

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: config.serviceName });
  });

  // Basic route skeleton — real routes will be mounted under /api in later phases
  app.get('/', (_req: Request, res: Response) => {
    res.json({ message: `${config.serviceName} is running` });
  });

  // Mount API routes
  try {
    // Lazy-load routes to avoid circular deps in early phases
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const specRoutes = require('../api/routes/spec.routes').default;
    app.use('/spec', specRoutes);
  } catch (e) {
    // ignore if routes are not yet available
  }

  try {
    // Mount environment routes when available
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const environmentRoutes = require('../api/routes/environment.routes').default;
    app.use('/environment', environmentRoutes);
  } catch (e) {
    // ignore if routes are not yet available
  }

  // Error handler should be last
  app.use(errorHandler);

  Logger.info('app:created', { service: config.serviceName, env: config.nodeEnv });

  return app;
}

export default createApp;
