import AxiosExecutionAdapter from '../../../../src/infrastructure/http/AxiosExecutionAdapter';
import AxiosClient from '../../../../src/infrastructure/http/AxiosClient';
import type { Operation } from '../../../../src/domain/models/Operation';
import type { EnvironmentConfig } from '../../../../src/domain/models/EnvironmentConfig';

describe('AxiosExecutionAdapter', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('executes a simple GET and returns response and timing', async () => {
    const op: Operation = {
      operationId: 'GET_/ping',
      method: 'GET',
      path: '/ping',
    } as Operation;

    const env: EnvironmentConfig = {
      id: 'env-1',
      specId: 'spec-1',
      name: 'local',
      baseUrl: 'http://localhost:4000',
    } as EnvironmentConfig;

    const mockResp = { status: 200, headers: { 'content-type': 'application/json' }, data: { ok: true } };
    jest.spyOn(AxiosClient, 'request').mockResolvedValue(mockResp as any);

    const res = await AxiosExecutionAdapter.executeOperation(op, env);

    expect(res.response).not.toBeNull();
    expect(res.response?.status).toBe(200);
    expect(res.request.url).toBe('http://localhost:4000/ping');
    expect(res.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('builds url with path params, query params and includes headers/body', async () => {
    const op: Operation = {
      operationId: 'POST_/items/{id}',
      method: 'POST',
      path: '/items/{id}',
      requestBody: { content: { 'application/json': { example: { item: 'x' } } } } as any,
    } as Operation;

    const env: EnvironmentConfig = {
      id: 'env-2',
      specId: 'spec-1',
      name: 'qa',
      baseUrl: 'https://api.example.com/v1/',
      defaultHeaders: { 'x-default': 'yes' },
    } as EnvironmentConfig;

    const mockResp = { status: 201, headers: {}, data: { created: true } };
    const spy = jest.spyOn(AxiosClient, 'request').mockResolvedValue(mockResp as any);

    const res = await AxiosExecutionAdapter.executeOperation(op, env, {
      pathParams: { id: 42 },
      query: { filter: ['a', 'b'], q: 'search' },
      headers: { 'x-custom': '1' },
      body: { override: true },
    });

    expect(spy).toHaveBeenCalled();
    expect(res.response?.status).toBe(201);
    expect(res.request.url).toContain('https://api.example.com/v1/items/42');
    expect(res.request.headers).toMatchObject({ 'x-default': 'yes', 'x-custom': '1' });
    expect((res.request.body as any).override).toBe(true);
  });
});
