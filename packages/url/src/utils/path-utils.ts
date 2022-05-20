import {ResourceKey} from '../types';
import {isQuotedString, quoted, unquoted} from './string-utils';
import {splitString} from './tokenizer';

const percentRegEx = /%/g;
const backslashRegEx = /\\/g;
const newlineRegEx = /\n/g;
const carriageReturnRegEx = /\r/g;
const tabRegEx = /\t/g;
const resourceKeyRegEx = /^([^|]+)(?:\|(.*))?$/;
const simpleKeyRegEx = /^[A-Z\d_$\-.]+$/i
const isWindows = global.process && global.process.platform === 'win32';

export function joinPath(...p: string[]) {
  let out = '';
  let s: string;
  for (let i = 0, l = p.length; i < l; i++) {
    s = p[i];
    if (s)
      out += (out ? '/' : '') + normalizePath(s);
  }
  return out;
}

export function normalizePath(p: string): string {
  if (!p)
    return '';
  while (p.startsWith('/'))
    p = p.substring(1);
  while (p.endsWith('/'))
    p = p.substring(0, p.length - 1);
  return p;
}


export function encodePathComponent(resource: string, key?: ResourceKey): string {
  const res = encodePathValue(resource);
  const k = encodePathValue(key);
  return res + (k ? '|' + k : '');
}

function encodePathValue(v: any): string {
  if (v == null || v === '')
    return '';
  if (typeof v === 'number')
    return '' + v;
  if (typeof v === 'boolean')
    return v ? 'true' : 'false';
  if (typeof v === 'object')
    return Object.keys(v).map((k) => {
      return encodePathValue('' + k) + '=' + encodePathValue(v[k]);
    }).join(';');
  v = '' + v;
  if (simpleKeyRegEx.test(v))
    return v;
  return quoted(v);
}

export function decodePathComponent(input: string): { resource: string; key: ResourceKey } {
  const m = resourceKeyRegEx.exec(input);
  if (!m)
    throw Object.assign(
      new TypeError('Invalid URL path'), {pathComponent: input, code: 'ERR_INVALID_URL_PATH'});
  const resource = m[1];
  let key: ResourceKey;
  if (m[2]) {
    const b = splitString(m[2] || '', {delimiters: ';', quotes: true})
    for (const k of b) {
      const c = splitString(k, {delimiters: '=', quotes: true});
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
        key[c.shift() || ''] = decodePathValue(c.join('='));
      } else
        key = decodePathValue(c[0]);
    }
  }
  return {resource, key};
}

function decodePathValue(input: string): any {
  let s = decodeURIComponent(input);
  if (isQuotedString(s))
    return unquoted(s);
  s = unquoted(s);
  return s;
}

export function encodePathChars(filepath: string): string {
  if (filepath.includes('%'))
    filepath = filepath.replace(percentRegEx, '%25');
  // In posix, backslash is a valid character in paths:
  if (!isWindows && filepath.includes('\\'))
    filepath = filepath.replace(backslashRegEx, '%5C');
  if (filepath.includes('\n'))
    filepath = filepath.replace(newlineRegEx, '%0A');
  if (filepath.includes('\r'))
    filepath = filepath.replace(carriageReturnRegEx, '%0D');
  if (filepath.includes('\t'))
    filepath = filepath.replace(tabRegEx, '%09');
  return filepath;
}
