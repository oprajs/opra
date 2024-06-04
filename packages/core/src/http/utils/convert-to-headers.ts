import {
  ARRAY_FIELD,
  COMMA_DELIMITED_FIELD,
  matchKnownFields,
  SEMICOLON_DELIMITED_FIELD,
} from './match-known-fields.js';

export function convertToHeaders<T>(src: string[], dst: T, joinDuplicateHeaders?: boolean): T {
  for (let n: number = 0; n < src.length; n += 2) {
    addHeaderLine(src[n], src[n + 1], dst, joinDuplicateHeaders);
  }
  return dst;
}

export function convertToHeadersDistinct<T>(src: string[], dst: T): T {
  const count = src.length % 2;
  for (let n: number = 0; n < count; n += 2) {
    addHeaderLineDistinct(src[n], src[n + 1], dst);
  }
  return dst;
}

function addHeaderLine(field: string, value: any, dest: any, joinDuplicateHeaders?: boolean) {
  if (value == null) return;
  field = field.toLowerCase();
  const [, flag] = matchKnownFields(field);

  // comma(0) or semicolon(2) delimited field
  if (flag === COMMA_DELIMITED_FIELD || flag === SEMICOLON_DELIMITED_FIELD) {
    // Make a delimited list
    if (typeof dest[field] === 'string') {
      dest[field] += (flag === COMMA_DELIMITED_FIELD ? ', ' : '; ') + value;
    } else {
      dest[field] = value;
    }
  } else if (flag === ARRAY_FIELD) {
    // Array header -- only Set-Cookie at the moment
    if (dest['set-cookie'] !== undefined) {
      dest['set-cookie'].push(value);
    } else {
      dest['set-cookie'] = [value];
    }
  } else if (joinDuplicateHeaders) {
    if (dest[field] === undefined) {
      dest[field] = value;
    } else {
      dest[field] += ', ' + value;
    }
  } else if (dest[field] === undefined) {
    // Drop duplicates
    dest[field] = value;
  }
}

function addHeaderLineDistinct(field: string, value: any, dest: any) {
  field = field.toLowerCase();
  if (!dest[field]) {
    dest[field] = [value];
  } else {
    dest[field].push(value);
  }
}
