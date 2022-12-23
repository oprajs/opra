const quotesRegEx = /'/g
const unescapeRegEx = /\\(.)/g;
const escapeRegEx = /(\\)/g;
const invalidQuoteCharsRegEx = /([,&#/?])/g;

function escapeQueryString(s: string): string {
  return s.replace(escapeRegEx, '\\\\');
}

function unescapeQueryString(s: string): string {
  return s.replace(unescapeRegEx, '$1');
}

function quoteQueryString(s: string): string {
  if (s && invalidQuoteCharsRegEx.test(s))
    return "'" + s.replace(invalidQuoteCharsRegEx, '$1') + "'";
  return s;
}

function unquoteQueryString(s: string): string {
  const quote = s.charAt(0);
  if ((quote === '"' || quote === "'") && s.charAt(s.length - 1) === quote)
    return unescapeQueryString(s.substring(1, s.length - 1));
  return s;
}

const invalidQueryCharsRegEx = /[#&%|\\\n\r\t]/g;
const encodeQueryComponentReplaces = (c) => {
  return '%' + c.charCodeAt(0).toString(16);
}

export function encodeQueryComponent(name: string, value?: string | string[]): string {
  if (name == null || name === '')
    return '';
  let out = quoteQueryString(('' + name).replace(invalidQueryCharsRegEx, encodeQueryComponentReplaces));
  if (value) {
    out += '=' + (Array.isArray(value)
        ? value.map(
            x => quoteQueryString(('' + x).replace(invalidQueryCharsRegEx, encodeQueryComponentReplaces))
        ).join(',')
        : ('' + value).replace(invalidQueryCharsRegEx, encodeQueryComponentReplaces));
  }
  return out;
}
