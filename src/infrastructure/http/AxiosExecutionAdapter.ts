import AxiosClient from './AxiosClient';
import type { Operation } from '../../domain/models/Operation';
import type { EnvironmentConfig } from '../../domain/models/EnvironmentConfig';

export interface ExecuteOverrides {
  pathParams?: Record<string, string | number>;
  query?: Record<string, any>;
  headers?: Record<string, string>;
  body?: any;
  timeoutMs?: number;
}

export interface ExecuteResult {
  request: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: unknown;
  };
  response: {
    status: number;
    headers: any;
    data: unknown;
  } | null;
  durationMs: number;
  error?: unknown;
}

function replacePathParams(path: string, params?: Record<string, string | number>): string {
  if (!params) return path;
  return path.replace(/\{([^}]+)\}/g, (_, name) => {
    const v = params[name];
    return v === undefined || v === null ? `{${name}}` : encodeURIComponent(String(v));
  });
}

export class AxiosExecutionAdapter {
  static async executeOperation(op: Operation, env: EnvironmentConfig, overrides?: ExecuteOverrides): Promise<ExecuteResult> {
    const start = Date.now();

    const path = replacePathParams(op.path, overrides?.pathParams);

    // Build URL
    const base = env.baseUrl.replace(/\/$/, '');
    const url = `${base}${path.startsWith('/') ? '' : '/'}${path}`;

    // Query string
    let finalUrl = url;
    if (overrides?.query && Object.keys(overrides.query).length > 0) {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(overrides.query)) {
        if (v === undefined || v === null) continue;
        if (Array.isArray(v)) {
          for (const it of v) params.append(k, String(it));
        } else {
          params.append(k, String(v));
        }
      }
      finalUrl = `${finalUrl}${finalUrl.includes('?') ? '&' : '?'}${params.toString()}`;
    }

    // Headers
    const headers: Record<string, string> = {
      ...(env.defaultHeaders ?? {}),
      ...(overrides?.headers ?? {}),
    };

    // Body: prefer override, fallback to first example if present
    let body = overrides?.body;
    try {
      if (body === undefined && op.requestBody && op.requestBody.content) {
        // naive: look for application/json example
        const jsonDesc = op.requestBody.content['application/json'];
        if (jsonDesc && (jsonDesc as any).example !== undefined) {
          body = (jsonDesc as any).example;
        }
      }
    } catch (e) {
      // ignore and proceed without body
    }

    const method = op.method.toLowerCase() as any;

    const reqConfig: any = {
      method,
      url: finalUrl,
      headers,
      data: body,
      timeout: overrides?.timeoutMs ?? 20000,
    };

    try {
      const resp = await AxiosClient.request<any>(reqConfig);
      const duration = Date.now() - start;
      return {
        request: { method: op.method, url: finalUrl, headers, body },
        response: { status: resp.status, headers: resp.headers, data: resp.data },
        durationMs: duration,
      };
    } catch (err) {
      const duration = Date.now() - start;
      return {
        request: { method: op.method, url: finalUrl, headers, body },
        response: null,
        durationMs: duration,
        error: err,
      };
    }
  }
}

export default AxiosExecutionAdapter;
