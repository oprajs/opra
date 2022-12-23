import { splitString } from 'fast-tokenizer';
import isPlainObject from 'putil-isplainobject';

export function normalizePath(p?: string, noLeadingSlash?: boolean): string {
  if (!p)
    return '';
  while (noLeadingSlash && p.startsWith('/'))
    p = p.substring(1);
  while (p.endsWith('/'))
    p = p.substring(0, p.length - 1);
  return p;
}

export function joinPath(...p: string[]): string {
  const out: string[] = [];
  let s: string;
  for (let i = 0, l = p.length; i < l; i++) {
    s = normalizePath(p[i], i > 0);
    if (s)
      out.push(s);
  }
  return out.join('/');
}


const pathComponentRegEx = /^([^/?#:@]+)(?:@([^/?#:]*))?(?:::(.*))?$/;

export function decodePathComponent(input: string): { resource: string, key?: any, typeCast?: string } {
  const m = pathComponentRegEx.exec(input);
  if (!m)
    throw Object.assign(
        new TypeError('Invalid URL path'), {
          code: 'ERR_INVALID_URL_PATH',
          input,
        });
  const resource = decodeURIComponent(m[1]);
  let key: any;
  if (m[2]) {
    const s = decodeURIComponent(m[2] || '');
    const b = splitString(s, {delimiters: ';', quotes: true, escape: false})
    for (const k of b) {
      const c = splitString(k, {delimiters: '=', quotes: true, escape: false});
      if ((b.length > 1 && c.length < 2) ||
          (key &&
              (c.length >= 2 && typeof key !== 'object') ||
              (c.length < 2 && typeof key === 'object')
          )
      )
        throw Object.assign(
            new TypeError('Invalid URL path. name:value pair required for multiple key format'), {
              pathComponent: input,
              code: 'ERR_INVALID_URL_PATH'
            });

      if (c.length >= 2) {
        key = key || {};
        key[c.shift() || ''] = c.join('=');
      } else
        key = c[0];
    }
  }
  if (m[3]) {
    return {resource, key, typeCast: m[3]};
  }
  return {resource, key};
}

export function encodePathComponent(resource: string, key?: any, typeCast?: string): string {
  if (resource == null)
    return '';
  let keyString = '';
  if (key !== '' && key != null) {
    if (isPlainObject(key)) {
      const arr: string[] = [];
      for (const k of Object.keys(key)) {
        arr.push(encodeURIComponent(k) + '=' + encodeURIComponent(key[k]));
      }
      keyString = arr.join(';');
    } else keyString = encodeURIComponent('' + key);
  }
  if (typeCast)
    typeCast = encodeURIComponent(typeCast);

  return encodeURIComponent(resource).replace(/%24/, '$') +
      (keyString ? '@' + keyString : '') +
      (typeCast ? '::' + typeCast : '')
}
