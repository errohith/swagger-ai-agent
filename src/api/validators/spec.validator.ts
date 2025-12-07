export type ImportSpecBody = { source: { type: 'url' | 'file' | 'git'; url?: string; path?: string; repo?: string; ref?: string; filePath?: string } };

export function validateImportSpecBody(body: any): ImportSpecBody {
  if (!body || typeof body !== 'object') throw new Error('Request body must be an object');
  const src = body.source;
  if (!src || typeof src !== 'object') throw new Error('Missing `source` object');
  if (!src.type || !['url', 'file', 'git'].includes(src.type)) throw new Error('source.type must be one of: url, file, git');
  if (src.type === 'url' && !src.url) throw new Error('source.url is required for type=url');
  if (src.type === 'file' && !src.path) throw new Error('source.path is required for type=file');
  if (src.type === 'git' && (!src.repo || !src.filePath)) throw new Error('source.repo and source.filePath are required for type=git');
  return body as ImportSpecBody;
}

export default validateImportSpecBody;
