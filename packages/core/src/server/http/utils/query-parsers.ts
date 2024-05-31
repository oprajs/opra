import { splitString } from 'fast-tokenizer';

export function parseArrayParam(v?: string | null): string[] | undefined {
  if (!v) return;
  return splitString(v, {
    delimiters: ',',
    quotes: true,
    brackets: true,
    keepBrackets: true,
    keepQuotes: true,
  }).map(x => x.trim());
}
