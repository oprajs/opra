import type { IncomingHttpHeaders } from 'http';
import {
  ARRAY_FIELD,
  COMMA_DELIMITED_FIELD,
  matchKnownFields,
  SEMICOLON_DELIMITED_FIELD,
} from './match-known-fields.js';

export function convertToRawHeaders(
  src: IncomingHttpHeaders | Record<string, any>,
): string[] {
  return Object.entries(src).reduce((a, [field, v]) => {
    const [name, flag] = matchKnownFields(field);

    if (flag === ARRAY_FIELD) {
      if (Array.isArray(v)) v.forEach(x => a.push(name, String(x)));
      else a.push(name, String(v));
      return a;
    }

    if (flag === COMMA_DELIMITED_FIELD || flag === SEMICOLON_DELIMITED_FIELD) {
      v = Array.isArray(v)
        ? v.join(flag === COMMA_DELIMITED_FIELD ? ', ' : '; ')
        : String(v);
    } else v = Array.isArray(v) ? String(v[0]) : String(v);

    a.push(name, v);

    return a;
  }, [] as string[]);
}
