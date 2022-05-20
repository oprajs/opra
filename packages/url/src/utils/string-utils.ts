const quoteRegEx = /['"]/g;

export function escapeQuotes(input: string): string {
  return escapeString(input).replace(quoteRegEx, (matched) => matched + matched);
}

export function quoted(input: string, quoteChar: '\'' | '"' = '"'): string {
  return quoteChar +
    escapeString(input).replace(new RegExp(quoteChar, 'g'), quoteChar + quoteChar) +
    quoteChar;
}

export function isQuotedString(input: string): boolean {
  if (!input)
    return false;
  const c = input.charAt(0);
  return (c === '"' || c === "'") && input.endsWith(c);
}

export function unquoted(input: string): string {
  let quoteChar = '';
  let ignoreNext = false;
  return input.replace(quoteRegEx, (matched, index: number, str) => {
    if (quoteChar) {
      if (matched !== quoteChar)
        return matched;
      if (str.charAt(index + 1) !== matched) {
        quoteChar = '';
        return '';
      }
    }
    if (ignoreNext) {
      ignoreNext = false;
      return '';
    }
    if (str.charAt(index + 1) === matched) {
      ignoreNext = true;
      return matched;
    }
    if (!quoteChar) {
      quoteChar = matched;
      return '';
    }
    return matched;
  });
}

/**
 *
 */

export function quoteString(s: string, quotes: string = '\''): string {
  return quotes +
    escapeString(s).replace(new RegExp(quotes, 'g'), 'x' + quotes) +
    quotes;
}

export function unquoteString(s: string): string {
  const quote = s.charAt(0);
  if (!s.endsWith(quote))
    return s;
  return unescapeString(s.substring(1, s.length - 1));
}

function unescapeString(s: string): string {
  return s.replace(/\\(.)/g, '$1');
}

function escapeString(s: string): string {
  return s.replace(/(\\)/g, '\\\\');
}
