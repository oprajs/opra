import type { RequestParseFunction } from '../request-parser.js';

export const stringParser: RequestParseFunction = function (buffer: Buffer): any {
  return buffer.toString();
};
