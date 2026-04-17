import type { RequestParseFunction } from '../request-parser.js';

/**
 * A parser function that converts the input buffer to a string.
 *
 * @param buffer - The buffer to be converted.
 * @returns The buffer content as a string.
 */
export const stringParser: RequestParseFunction = function (
  buffer: Buffer,
): any {
  return buffer.toString();
};
