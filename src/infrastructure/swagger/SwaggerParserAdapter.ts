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
      // Try YAML via dynamic import of `js-yaml` if available
      try {
        // dynamic import so that dependency is optional in Phase 3
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const yaml = await import('js-yaml');
        return yaml.load(raw);
      } catch (err: any) {
        throw new Error(
          'SwaggerParserAdapter.parse failed: raw content is not valid JSON and `js-yaml` is not available to parse YAML. Install `js-yaml` or provide JSON.'
        );
      }
    }
  }
}

export default SwaggerParserAdapter;
/**
 * SwaggerParserAdapter
 *
 * A thin adapter around a Swagger/OpenAPI parser library. For Phase 3 this
 * adapter provides a small stable API (`parse`) and currently performs a
 * no-op pass-through. In later micro-tasks it will call `swagger-parser`
 * or `@apidevtools/swagger-parser` to dereference and validate specs.
 */

export class SwaggerParserAdapter {
  /**
   * Parse raw spec content (object or string) and return a standardized
   * representation. Currently a pass-through placeholder.
   */
  async parse(rawSpec: unknown): Promise<any> {
    // TODO: integrate a real parser (e.g. @apidevtools/swagger-parser)
    return rawSpec;
  }
}

export default SwaggerParserAdapter;
