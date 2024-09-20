import { binaryParser } from './parsers/binary.parser.js';
import { stringParser } from './parsers/string.parser.js';
import type { RequestParseFunction } from './types.js';

export const RequestParser: Record<string, RequestParseFunction> = {
  BINARY: binaryParser,
  STRING: stringParser,
};
