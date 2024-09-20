import type { RequestParseFunction } from '../types.js';

export const stringParser: RequestParseFunction = function (buffer: Buffer): any {
  return buffer.toString();
};
