import type { RequestParseFunction } from '../types.js';

export const binaryParser: RequestParseFunction = function (buffer: Buffer): any {
  return buffer;
};
