import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

export type NodeEnv = 'development' | 'production' | 'test' | 'staging';

export interface Env {
  NODE_ENV: NodeEnv;
  PORT: number;
  LOG_LEVEL: string;
  SERVICE_NAME: string;
  [key: string]: unknown;
}

let cachedEnv: Env | null = null;

/**
 * Load environment variables from .env and .env.{NODE_ENV} (if present),
 * coerce types and return a typed Env object.
 */
export function loadEnv(): Env {
  if (cachedEnv) return cachedEnv;

  // Load base .env if present
  const basePath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(basePath)) {
    dotenv.config({ path: basePath });
  }

  // Load environment-specific .env.{NODE_ENV}
  const nodeEnv = (process.env.NODE_ENV || 'development') as NodeEnv;
  const envPath = path.resolve(process.cwd(), `.env.${nodeEnv}`);
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true });
  }

  // Build typed env with safe defaults
  const rawPort = process.env.PORT ?? '3000';
  const port = Number(rawPort);
  // Allow 0 as a valid ephemeral port (useful in tests); reject negative or NaN
  if (Number.isNaN(port) || port < 0) {
    throw new Error(`Invalid PORT value: ${String(rawPort)}`);
  }

  const env: Env = {
    NODE_ENV: nodeEnv,
    PORT: port,
    LOG_LEVEL: (process.env.LOG_LEVEL || 'info') as string,
    SERVICE_NAME: process.env.SERVICE_NAME || 'swagger-ai-agent',
  };

  cachedEnv = env;
  return env;
}

/**
 * Return the cached Env object or load it lazily.
 */
export function getEnv(): Env {
  return cachedEnv ?? loadEnv();
}

export function isTest(): boolean {
  return getEnv().NODE_ENV === 'test';
}

export default { loadEnv, getEnv, isTest };
