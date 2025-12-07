import path from 'path';
import fs from 'fs';
import { getEnv } from './env';

export type NodeEnv = 'development' | 'production' | 'test' | 'staging';

export interface SwaggerConfig {
  maxSpecSizeBytes: number;
}

export interface Config {
  nodeEnv: NodeEnv;
  port: number;
  logLevel: string;
  serviceName: string;
  swagger: SwaggerConfig;
  [key: string]: unknown;
}

/** Default configuration used when no external config files are present. */
const DEFAULTS: Config = {
  nodeEnv: 'development',
  port: 3000,
  logLevel: 'info',
  serviceName: 'swagger-ai-agent',
  swagger: {
    maxSpecSizeBytes: 5_000_000, // 5MB
  },
};

let cachedConfig: Config | null = null;

/**
 * Load runtime config. Will merge defaults with environment values.
 * If a `config/*.json` file exists it will be merged (non-TS fallback).
 */
export function loadConfig(): Config {
  if (cachedConfig) return cachedConfig;

  const env = getEnv();

  // Start with defaults
  const config: Config = { ...DEFAULTS };

  // Apply environment overrides
  config.nodeEnv = env.NODE_ENV;
  config.port = env.PORT;
  config.logLevel = (env.LOG_LEVEL as string) ?? DEFAULTS.logLevel;
  config.serviceName = (env.SERVICE_NAME as string) ?? DEFAULTS.serviceName;

  // If a JSON config exists under ./config/{NODE_ENV}.json or ./config/default.json, merge it.
  try {
    const configDir = path.resolve(process.cwd(), 'config');
    const candidates = [
      path.join(configDir, `${env.NODE_ENV}.json`),
      path.join(configDir, 'default.json'),
    ];

    for (const c of candidates) {
      if (fs.existsSync(c)) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const fileConfig = JSON.parse(fs.readFileSync(c, 'utf8')) as Partial<Config>;
        Object.assign(config, fileConfig);
        break;
      }
    }
  } catch (err) {
    // ignore parse errors and continue with defaults + env
  }

  cachedConfig = config;
  return config;
}

export function getConfig(): Config {
  return cachedConfig ?? loadConfig();
}

export default { loadConfig, getConfig };
