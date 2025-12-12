import { SpecParseError } from '../../core/errors/AppError';

/**
 * SwaggerParserAdapter
 * Phase 3 skeleton that wraps a Swagger/OpenAPI parser.
 * Currently supports JSON parsing natively and will attempt to use `js-yaml`
 * for YAML if available. In later phases this adapter will wrap a
 * full-featured parser (e.g., `@apidevtools/swagger-parser` or `openapi-parser`).
 */
export class SwaggerParserAdapter {
  /**
   * Parse raw spec content (JSON or YAML) into a JS object.
   * @param raw Raw spec text (YAML or JSON)
   */
  static async parse(raw: string): Promise<any> {
    // Try JSON first
    try {
      return JSON.parse(raw);
    } catch (_) {
      // Try YAML via dynamic import of `js-yaml` if available.
      // Use a loose `any` import to avoid strict type dependency on `@types/js-yaml`.
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const yamlModule: any = await import('js-yaml');
        return yamlModule.load(raw);
      } catch (err: any) {
        throw new SpecParseError(
          'Failed to parse OpenAPI spec: content is not valid JSON and YAML parsing is unavailable. Install js-yaml package or provide valid JSON.',
          { parseError: err?.message }
        );
      }
    }
  }
}

export default SwaggerParserAdapter;
// Phase 3: single, static `parse` method above is the intended adapter.
