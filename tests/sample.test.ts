import { loadEnv, getEnv } from '../src/core/env';

describe('env loader', () => {
  test('loadEnv returns basic env properties', () => {
    const env = loadEnv();
    expect(env).toBeDefined();
    expect(typeof env.PORT).toBe('number');
    expect(typeof env.NODE_ENV).toBe('string');
    expect(typeof env.LOG_LEVEL).toBe('string');
    expect(typeof env.SERVICE_NAME).toBe('string');
  });

  test('getEnv returns cached env', () => {
    const e1 = getEnv();
    const e2 = getEnv();
    expect(e1).toBe(e2);
  });
});
