import { splitString } from 'fast-tokenizer';

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
