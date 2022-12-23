const quotesRegEx = /'/g
const escapeRegEx = /(\\)/g;
const unescapeRegEx = /\\(.)/g;

function escapeString(s: string): string {
  return s.replace(escapeRegEx, '\\\\');
}

function unescapeString(s: string): string {
  return s.replace(unescapeRegEx, '$1');
}

export function quoteFilterString(s: string): string {
  return "'" +
      escapeString(s).replace(quotesRegEx, '\\\'') +
      "'";
}

export function unquoteFilterString(s: string): string {
  if (s && (s.startsWith("'") || s.startsWith('"')) && s.endsWith(s.charAt(0))) {
    return unescapeString(s.substring(1, s.length - 1));
  }
  /* istanbul ignore next */
  return s;
}
