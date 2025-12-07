import axios from 'axios';
import fs from 'fs/promises';

export type GitSource = {
  repo: string;
  ref?: string;
  filePath: string;
};

export type SpecSource =
  | { type: 'url'; url: string }
  | { type: 'file'; path: string }
  | { type: 'git'; repo: string; ref?: string; filePath: string };

/**
 * SwaggerLoader
 * Phase 3 skeleton for loading OpenAPI/Swagger content from different sources.
 * - `loadFromUrl` and `loadFromFile` are implemented.
 * - `loadFromGit` is a placeholder (not implemented in Phase 3 skeleton).
 */
export class SwaggerLoader {
  /**
   * Load spec content from a remote URL (http/https).
   * Returns raw text (YAML or JSON) as string.
   */
  static async loadFromUrl(url: string): Promise<string> {
    try {
      const resp = await axios.get<string>(url, {
        responseType: 'text',
        timeout: 15000,
        headers: { 'Accept': 'application/json, application/yaml, text/yaml, */*' },
      });
      return resp.data;
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      throw new Error(`SwaggerLoader.loadFromUrl failed for ${url}: ${msg}`);
    }
  }

  /**
   * Load spec content from a local file path. Returns raw text.
   */
  static async loadFromFile(filePath: string): Promise<string> {
    try {
      const data = await fs.readFile(filePath, { encoding: 'utf8' });
      return data;
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      throw new Error(`SwaggerLoader.loadFromFile failed for ${filePath}: ${msg}`);
    }
  }

  /**
   * Load spec content from a git repository. Phase 3 skeleton — not implemented.
   * In later phases this method can clone the repo, checkout `ref`, and read `filePath`.
   */
  static async loadFromGit(source: GitSource): Promise<string> {
    throw new Error('SwaggerLoader.loadFromGit is not implemented in the Phase 3 skeleton.');
  }
}

export default SwaggerLoader;
