import type { RequestParseFunction } from '../request-parser.js';

export const binaryParser: RequestParseFunction = function (buffer: Buffer): any {
  return buffer;
};
