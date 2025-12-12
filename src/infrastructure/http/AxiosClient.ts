import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import Logger from '../logging/Logger';
import { ExecutionError } from '../../core/errors/AppError';

/**
 * AxiosClient
 * Production-ready wrapper around axios with timeout, retry, and error handling.
 * Phase 12: Hardening - Added retry logic and structured logging.
 */
export class AxiosClient {
  /**
   * Execute HTTP request with automatic retry on network errors
   * @param config Axios request configuration
   * @param retries Number of retry attempts (default: 2)
   * @returns Response with status, headers, and data
   */
  static async request<T = any>(config: AxiosRequestConfig, retries = 2): Promise<{ status: number; headers: any; data: T }> {
    const cfg: AxiosRequestConfig = {
      timeout: config.timeout ?? 20000,
      validateStatus: () => true, // do not throw on non-2xx — let caller decide
      ...config,
    };

    let lastError: any;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const resp: AxiosResponse<T> = await axios.request<T>(cfg);
        if (attempt > 0) {
          Logger.info('axios:retry:success', { url: cfg.url, attempt });
        }
        return { status: resp.status, headers: resp.headers, data: resp.data };
      } catch (err: any) {
        lastError = err;
        const isNetworkError = err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND';
        
        if (isNetworkError && attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          Logger.warn('axios:retry:attempt', { url: cfg.url, attempt: attempt + 1, delay, error: err.message });
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        break;
      }
    }

    const msg = lastError?.message ?? String(lastError);
    Logger.error('axios:request:failed', { url: cfg.url, error: msg });
    throw new ExecutionError(
      `HTTP request failed after ${retries + 1} retry attempts`,
      { url: cfg.url, attempts: retries + 1, error: msg }
    );
  }
}

export default AxiosClient;
