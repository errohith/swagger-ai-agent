import fs from 'fs';
import path from 'path';
import winston from 'winston';
import { getConfig } from '../../core/config';

export interface ILogger {
  error(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
  child(meta: Record<string, unknown>): ILogger;
}

class WinstonLogger implements ILogger {
  private logger: winston.Logger;

  constructor(logger: winston.Logger) {
    this.logger = logger;
  }

  error(message: string, meta: Record<string, unknown> = {}): void {
    this.logger.error(message, meta);
  }
  warn(message: string, meta: Record<string, unknown> = {}): void {
    this.logger.warn(message, meta);
  }
  info(message: string, meta: Record<string, unknown> = {}): void {
    this.logger.info(message, meta);
  }
  debug(message: string, meta: Record<string, unknown> = {}): void {
    this.logger.debug(message, meta);
  }
  child(meta: Record<string, unknown>): ILogger {
    const childLogger = this.logger.child(meta);
    return new WinstonLogger(childLogger);
  }
}

function createWinstonLogger(): ILogger {
  const config = getConfig();

  const logsDir = path.resolve(process.cwd(), 'logs');
  try {
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
  } catch (e) {
    // Best-effort; continue without failing the app
  }

  const consoleTransport = new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
        return `${timestamp} ${level}: ${message} ${metaStr}`;
      })
    ),
  });

  const fileTransport = new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  });

  const errorFile = new winston.transports.File({
    level: 'error',
    filename: path.join(logsDir, 'error.log'),
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  });

  const logger = winston.createLogger({
    level: config.logLevel || 'info',
    defaultMeta: { service: config.serviceName },
    transports: [consoleTransport, fileTransport, errorFile],
  });

  return new WinstonLogger(logger);
}

export const Logger: ILogger = createWinstonLogger();

export default Logger;
