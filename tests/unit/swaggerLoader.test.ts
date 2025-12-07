import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import SwaggerLoader from '../../src/infrastructure/swagger/SwaggerLoader';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SwaggerLoader', () => {
  const tmpDir = path.resolve(__dirname, '../tmp');

  beforeAll(async () => {
    await fs.mkdir(tmpDir, { recursive: true });
  });

  afterAll(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  test('loadFromFile reads file content', async () => {
    const filePath = path.join(tmpDir, 'spec.json');
    const content = '{"swagger":"2.0","info":{"title":"t","version":"1.0.0"},"paths":{}}';
    await fs.writeFile(filePath, content, 'utf8');
    const res = await SwaggerLoader.loadFromFile(filePath);
    expect(res).toBe(content);
  });

  test('loadFromUrl fetches content via axios', async () => {
    const url = 'https://example.com/swagger.json';
    const content = '{"openapi":"3.0.0","info":{"title":"t2","version":"1.0.0"},"paths":{}}';
    mockedAxios.get.mockResolvedValueOnce({ data: content } as any);
    const res = await SwaggerLoader.loadFromUrl(url);
    expect(res).toBe(content);
    expect(mockedAxios.get).toHaveBeenCalledWith(url, expect.objectContaining({ responseType: 'text' }));
  });
});
