import { ValidationError } from '../../core/errors/AppError';

export type ImportSpecBody = 
  | { source: { type: 'url' | 'file' | 'git'; url?: string; path?: string; repo?: string; ref?: string; filePath?: string } }
  | { specContent: string; format?: 'yaml' | 'json' };

export function validateImportSpecBody(body: any): ImportSpecBody {
  if (!body || typeof body !== 'object') throw new ValidationError('Request body must be an object');
  
  // Support direct content upload
  if (body.specContent && typeof body.specContent === 'string') {
    return { specContent: body.specContent, format: body.format || 'yaml' } as ImportSpecBody;
  }
  
  // Support source-based upload
  const src = body.source;
  if (!src || typeof src !== 'object') throw new ValidationError('Missing `source` object or `specContent`');
  if (!src.type || !['url', 'file', 'git'].includes(src.type)) throw new ValidationError('source.type must be one of: url, file, git', { providedType: src.type });
  if (src.type === 'url' && !src.url) throw new ValidationError('source.url is required for type=url');
  if (src.type === 'file' && !src.path) throw new ValidationError('source.path is required for type=file');
  if (src.type === 'git' && (!src.repo || !src.filePath)) throw new ValidationError('source.repo and source.filePath are required for type=git');
  return body as ImportSpecBody;
}

export default validateImportSpecBody;
