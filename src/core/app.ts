import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { getConfig } from './config';
import requestLogger from './middlewares/requestLogger';
import errorHandler from './middlewares/errorHandler';
import Logger from '../infrastructure/logging/Logger';

export function createApp(): Application {
  const app = express();
  const config = getConfig();

  // Enable CORS for frontend (Vite dev server on port 5173)
  app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

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
    app.use('/api/spec', specRoutes);
  } catch (e) {
    // ignore if routes are not yet available
  }

  try {
    // Mount environment routes when available
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const environmentRoutes = require('../api/routes/environment.routes').default;
    app.use('/api/environment', environmentRoutes);
  } catch (e) {
    // ignore if routes are not yet available
  }

  try {
    // Mount execution routes when available
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const executionRoutes = require('../api/routes/execution.routes').default;
    app.use('/api/execution', executionRoutes);
  } catch (e) {
    // ignore if routes are not yet available
  }

  try {
    // Mount test generation routes when available
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const testgenRoutes = require('../api/routes/testgen.routes').default;
    app.use('/api/testgen', testgenRoutes);
  } catch (e) {
    // ignore if routes are not yet available
  }

  try {
    // Mount MCP routes when available
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mcpRoutes = require('../api/routes/mcp.routes').default;
    app.use('/api/mcp', mcpRoutes);
  } catch (e) {
    // ignore if routes are not yet available
  }

  try {
    // Mount Jest MCP routes when available (Phase 13)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const jestMcpRoutes = require('../api/routes/jest-mcp.routes').default;
    app.use('/api/mcp/jest', jestMcpRoutes);
  } catch (e) {
    // ignore if routes are not yet available
  }

  // Error handler should be last
  app.use(errorHandler);

  Logger.info('app:created', { service: config.serviceName, env: config.nodeEnv });

  return app;
}

export default createApp;
