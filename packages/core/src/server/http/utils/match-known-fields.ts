import { HttpHeaderCodes } from '@opra/common';

export const NO_DUPLICATES_FIELD = 0;
export const COMMA_DELIMITED_FIELD = 1;
export const SEMICOLON_DELIMITED_FIELD = 2;
export const ARRAY_FIELD = 3;

export type FIELD_FLAG =
  | typeof NO_DUPLICATES_FIELD
  | typeof COMMA_DELIMITED_FIELD
  | typeof SEMICOLON_DELIMITED_FIELD
  | typeof ARRAY_FIELD;

const ARRAY_HEADERS = ['set-cookie'];
const NO_DUPLICATES_HEADERS = [
  'age',
  'from',
  'etag',
  'server',
  'referer',
  'referrer',
  'expires',
  'location',
  'user-agent',
  'retry-after',
  'content-type',
  'content-length',
  'max-forwards',
  'last-modified',
  'authorization',
  'proxy-authorization',
  'if-modified-since',
  'if-unmodified-since',
];
const SEMICOLON_DELIMITED_HEADERS = ['cookie'];

const KNOWN_FIELDS: Record<string, [string, FIELD_FLAG]> = Object.values(HttpHeaderCodes).reduce((o, k) => {
  const n = k.toLowerCase();
  o[n] = [
    k,
    NO_DUPLICATES_HEADERS.includes(n)
      ? NO_DUPLICATES_FIELD
      : ARRAY_HEADERS.includes(n)
        ? ARRAY_FIELD
        : SEMICOLON_DELIMITED_HEADERS.includes(n)
          ? SEMICOLON_DELIMITED_FIELD
          : COMMA_DELIMITED_FIELD,
  ];
  return o;
}, {});

export function matchKnownFields(field: string): [string, FIELD_FLAG] {
  const x = KNOWN_FIELDS[field.toLowerCase()];
  return x ? x : [field, COMMA_DELIMITED_FIELD];
}
