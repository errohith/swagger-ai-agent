/**
 * validateSpec.usecase
 * Very small structural validator for OpenAPI/Swagger parsed objects.
 * Returns `{ valid: boolean, issues: string[] }`.
 */
export function validateSpec(parsedSpec: any): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!parsedSpec || typeof parsedSpec !== 'object') {
    issues.push('Spec is not an object');
    return { valid: false, issues };
  }

  if (!parsedSpec.info) issues.push('Missing `info` object (title/version)');
  else {
    if (!parsedSpec.info.title) issues.push('Missing `info.title`');
    if (!parsedSpec.info.version) issues.push('Missing `info.version`');
  }

  if (!parsedSpec.paths || Object.keys(parsedSpec.paths).length === 0) issues.push('No `paths` defined');

  const valid = issues.length === 0;
  return { valid, issues };
}

export default validateSpec;
