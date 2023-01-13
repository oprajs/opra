/**
 * Encode input string with standard encodeURIComponent and then un-encode specific characters.
 */
const ENCODING_REGEX = /%(\d[a-f0-9])/gi;
const ENCODING_REPLACEMENTS: { [x: string]: string } = {
  '2C': ',',
  '2F': '/',
  '24': '$',
  '3A': ':',
  '3B': ';',
  '3D': '=',
  '3F': '?',
  '40': '@'
};

export function encodeURIParam(v: string): string {
  return encodeURIComponent(v).replace(
      ENCODING_REGEX, (s, t) => ENCODING_REPLACEMENTS[t] ?? s);
}
