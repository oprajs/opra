import { HttpHeaderCodes } from '../enums/http-headers-codes.enum';

const knownKeys = Object.keys(HttpHeaderCodes);
const knownKeysLower = knownKeys.map(x => x.toLowerCase());

export function normalizeHeaders(headers: any, normalCase?: boolean): Record<string, string | string[]> {
  if (!headers)
    return {};
  return Object.keys(headers).reduce((o, k) => {
    const v = headers[k];
    const key = normalCase
        ? knownKeys[knownKeysLower.indexOf(k.toLowerCase())] || camelize(k) :
        k.toLowerCase();
    if (k.toLowerCase() === 'set-cookie')
      o[key] = Array.isArray(v) ? v : [v];
    else {
      o[key] = Array.isArray(v) ? v.join(';') : v;
    }
    return o;
  }, {} as any) || {};
}

function camelize(str) {
  return str.replace(/(^\w|[A-Z]|\b\w)/g, function (word) {
    return word.toUpperCase();
  });
}
