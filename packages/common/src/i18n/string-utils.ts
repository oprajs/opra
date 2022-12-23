const unescapeRegEx = /\\(.)/g;
const escapeRegEx = /(\\)/g;

export function escapeString(s: string): string {
  return s.replace(escapeRegEx, '\\\\');
}

export function unescapeString(s: string): string {
  return s.replace(unescapeRegEx, '$1');
}
