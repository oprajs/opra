import type { RequestParseFunction } from '../request-parser.js';

/**
 * A parser function that returns the input buffer as-is.
 *
 * @param buffer - The buffer to be returned.
 * @returns The original buffer.
 */
export const binaryParser: RequestParseFunction = function (
  buffer: Buffer,
): any {
  return buffer;
};
