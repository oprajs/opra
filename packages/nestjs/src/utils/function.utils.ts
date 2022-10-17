import { splitString, tokenize } from 'fast-tokenizer';

export function getNumberOfArguments(fn: Function): number | undefined {
  const functionAsString = fn.toString();
  const tokenizer = tokenize(functionAsString, {
    // keepBrackets: true,
    keepDelimiters: true,
    keepQuotes: true,
    brackets: {}
  });

  let k = 0;
  let s = '';
  for (const token of tokenizer) {
    if (token.startsWith('(')) {
      s += token.substring(1);
      k++;
    } else if (token.startsWith(')')) {
      if (k === 1)
        break;
    } else if (k) s += token;
  }

  const x = splitString(s, {
    brackets: {
      '{': '}',
      '(': ')',
      '[': ']',
      '/*': '*/'
    }, delimiters: ','
  });
  return x.length > 1 ? x.length : (x[0] ? 1 : 0);
}
