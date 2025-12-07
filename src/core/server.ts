import createApp from './app';
import { loadEnv } from './env';
import { getConfig } from './config';
import Logger from '../infrastructure/logging/Logger';

async function start(): Promise<void> {
  const env = loadEnv();
  const config = getConfig();

  const app = createApp();

  const port = config.port || env.PORT || 3000;

  const server = app.listen(port, () => {
    Logger.info('server:start', { port });
    // also echo to console for developer convenience
    // eslint-disable-next-line no-console
    console.log(`${config.serviceName} listening on ${port}`);
  });

  process.on('unhandledRejection', (reason) => {
    Logger.error('unhandledRejection', { reason: String(reason) });
  });

  process.on('uncaughtException', (err) => {
    Logger.error('uncaughtException', { err });
    // give logger a moment then exit
    setTimeout(() => process.exit(1), 1000);
  });

  process.on('SIGTERM', () => {
    Logger.info('process:SIGTERM', { message: 'shutting down' });
    server.close(() => process.exit(0));
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', err);
  Logger.error('server:start_failed', { err: String(err) });
  process.exit(1);
});
