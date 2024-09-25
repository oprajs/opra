import { binaryParser } from './parsers/binary.parser.js';
import { stringParser } from './parsers/string.parser.js';

export type RequestParseFunction = (buffer: Buffer) => any;

export const RequestParser: Record<string, RequestParseFunction> = {
  BINARY: binaryParser,
  STRING: stringParser,
};
