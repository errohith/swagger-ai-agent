import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * AxiosClient
 * Lightweight wrapper around axios for Phase 3 skeleton.
 * Exposes a single `request` method that returns status, headers and data.
 */
export class AxiosClient {
  static async request<T = any>(config: AxiosRequestConfig): Promise<{ status: number; headers: any; data: T }> {
    const cfg: AxiosRequestConfig = {
      timeout: 20000,
      validateStatus: () => true, // do not throw on non-2xx — let caller decide
      ...config,
    };

    try {
      const resp: AxiosResponse<T> = await axios.request<T>(cfg);
      return { status: resp.status, headers: resp.headers, data: resp.data };
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      throw new Error(`AxiosClient.request failed: ${msg}`);
    }
  }
}

export default AxiosClient;
import axios, { AxiosRequestConfig, AxiosInstance, AxiosResponse } from 'axios';
import { getConfig } from '../../core/config';

export interface HttpResponse<T = any> {
  status: number;
  headers: Record<string, string>;
  data: T;
}

export class AxiosClient {
  private client: AxiosInstance;

  constructor() {
    const config = getConfig();
    this.client = axios.create({
      timeout: 15000,
      headers: { 'User-Agent': `${config.serviceName}` },
    });
  }

  async request<T = any>(cfg: AxiosRequestConfig): Promise<HttpResponse<T>> {
    const resp: AxiosResponse<T> = await this.client.request<T>(cfg);
    const headers: Record<string, string> = {};
    Object.keys(resp.headers || {}).forEach((k) => (headers[k] = String((resp.headers as any)[k])));
    return { status: resp.status, headers, data: resp.data };
  }
}

export default AxiosClient;
