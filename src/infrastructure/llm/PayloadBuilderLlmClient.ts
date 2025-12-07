/**
 * PayloadBuilderLlmClient
 * Phase 3 placeholder for LLM-assisted payload generation.
 *
 * This file provides a minimal implementation that:
 * - Attempts to construct an example payload from an OpenAPI schema using
 *   schema examples/defaults/type hints.
 * - Exposes an async `buildFromSchema` method that returns a best-effort
 *   example object or `null` when nothing can be produced.
 *
 * In later phases this client will call an external LLM service to
 * synthesize richer payloads when schema data is insufficient.
 */

export type PayloadHints = {
  locale?: string;
  domain?: string;
  maxFields?: number;
};

export class PayloadBuilderLlmClient {
  constructor(private options?: { provider?: string }) {}

  /**
   * Build a best-effort payload from a JSON Schema / OpenAPI schema object.
   * - Uses `example` or `default` fields when available.
   * - For primitive types, returns a simple placeholder value.
   * - For objects, recursively builds payload for properties.
   * Returns `null` if schema is empty or cannot be interpreted.
   */
  async buildFromSchema(schema: any, hints?: PayloadHints): Promise<any | null> {
    if (!schema || typeof schema !== 'object') return null;

    // Prefer explicit example/default
    if (schema.example !== undefined) return schema.example;
    if (schema.default !== undefined) return schema.default;

    // Handle primitive types
    const type = schema.type;
    if (!type && schema.properties == null && schema.allOf == null && schema.oneOf == null) {
      // Unknown shape — return null to indicate LLM may be needed
      return null;
    }

    if (type === 'string') {
      if (schema.format === 'email') return 'user@example.com';
      if (schema.enum && Array.isArray(schema.enum)) return schema.enum[0];
      return 'string_example';
    }
    if (type === 'integer' || type === 'number') {
      if (schema.minimum !== undefined) return schema.minimum;
      if (schema.enum && Array.isArray(schema.enum)) return schema.enum[0];
      return 1;
    }
    if (type === 'boolean') return true;
    if (type === 'array') {
      const itemSchema = schema.items ?? {};
      const item = await this.buildFromSchema(itemSchema, hints);
      return item == null ? [] : [item];
    }

    // Object
    if (type === 'object' || schema.properties) {
      const result: Record<string, any> = {};
      const props = schema.properties ?? {};
      const keys = Object.keys(props);
      const max = hints?.maxFields ?? keys.length;
      for (let i = 0; i < Math.min(keys.length, max); i++) {
        const k = keys[i];
        try {
          result[k] = await this.buildFromSchema(props[k], hints);
        } catch {
          result[k] = null;
        }
      }
      return result;
    }

    // allOf / oneOf: try first subschema
    if (Array.isArray(schema.allOf) && schema.allOf.length) {
      return this.buildFromSchema(schema.allOf[0], hints);
    }
    if (Array.isArray(schema.oneOf) && schema.oneOf.length) {
      return this.buildFromSchema(schema.oneOf[0], hints);
    }

    return null;
  }

  /**
   * Placeholder: in future will call an LLM provider to enrich generated payloads.
   */
  async enrichWithLlm(_partialPayload: any, _hints?: PayloadHints): Promise<any> {
    // Phase 3: no-op — return the partial payload unchanged
    return _partialPayload;
  }
}

export default PayloadBuilderLlmClient;
