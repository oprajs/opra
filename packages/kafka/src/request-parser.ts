import { binaryParser } from './parsers/binary.parser.js';
import { stringParser } from './parsers/string.parser.js';

/**
 * Type definition for a function that parses a Buffer into a specific format.
 *
 * @param buffer - The buffer to be parsed.
 * @returns The parsed result.
 */
export type RequestParseFunction = (buffer: Buffer) => any;

/**
 * A registry of pre-defined request parsing functions.
 */
export const RequestParser: Record<string, RequestParseFunction> = {
  /* Parses the buffer as raw binary data (returns the buffer as-is). */
  BINARY: binaryParser,
  /* Parses the buffer as a UTF-8 string. */
  STRING: stringParser,
};
