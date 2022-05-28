const quotesRegEx = /'/g
const unescapeRegEx = /\\(.)/g;
const escapeRegEx = /(\\)/g;
const invalidQueryCharsRegEx = /([,&#/?])/g

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

export function quoteQueryString(s: string): string {
  if (s && invalidQueryCharsRegEx.test(s))
    return "'" + s.replace(invalidQueryCharsRegEx, '$1') + "'";
  return s;
}

export function unquoteQueryString(s: string): string {
  const quote = s.charAt(0);
  if ((quote === '"' || quote === "'") && s.charAt(s.length - 1) === quote)
    return unescapeString(s.substring(1, s.length - 1));
  return s;
}
