export type TokenCallback = ((current: string, prev: string, next: string) => boolean);

export interface TokenizerOptions {
  delimiters?: string | RegExp;
  brackets?: string | boolean;
  quotes?: string | boolean;
  escape?: string | RegExp | TokenCallback;
  keepDelimiters?: boolean | TokenCallback;
  keepQuotes?: boolean | TokenCallback;
  keepBrackets?: boolean | TokenCallback;
  emptyTokens?: boolean;
}

export interface Tokenizer {
  readonly input: string;
  readonly startIndex: number;
  readonly curIndex: number;
  readonly current: string;

  reset(): void;

  next(): string | null;

  all(): string[];

  join(separator?: string): string;

  [Symbol.iterator](): IterableIterator<string>;
}

export function splitString(input: string, options?: Omit<TokenizerOptions, 'emptyTokens'>): string[] {
  const out: string[] = [];
  const tokenizer = tokenize(input, {...options, emptyTokens: true});
  for (const x of tokenizer) {
    out.push(x || '');
  }
  return out;
}

export function tokenize(input: string, options?: TokenizerOptions): Tokenizer {
  input = input ? '' + input : '';
  const len = input.length;
  const delimiters = options?.delimiters != null ? options?.delimiters : tokenize.DEFAULT_DELIMITERS;
  const bracketChars = typeof options?.brackets === 'string' ? options.brackets
    : (options?.brackets === true ? tokenize.DEFAULT_BRACKETS : '');
  if (bracketChars.length % 2 !== 0)
    throw new Error('"brackets" option must contain even number of characters');
  const quoteChars = typeof options?.quotes === 'string' ? options.quotes
    : (options?.quotes === true ? tokenize.DEFAULT_QUOTES : '');
  const keepDelimiters: TokenCallback | undefined =
    options?.keepDelimiters == null ? undefined :
      (typeof options?.keepDelimiters === 'function'
          ? options.keepDelimiters
          : () => !!options?.keepDelimiters
      )
  const keepQuotes: TokenCallback | undefined = options?.keepQuotes == null ? undefined :
    (typeof options?.keepQuotes === 'function'
        ? options.keepQuotes
        : () => !!options?.keepQuotes
    )
  const keepBrackets: TokenCallback | undefined = options?.keepBrackets == null ? undefined :
    (typeof options?.keepBrackets === 'function'
        ? options.keepBrackets
        : () => !!options?.keepBrackets
    )
  const emptyTokens = !!options?.emptyTokens;
  // noinspection SuspiciousTypeOfGuard
  const optionsEscape = options?.escape || '\\';
  const escapeFn: TokenCallback = typeof optionsEscape === 'function'
    ? optionsEscape
    : (optionsEscape instanceof RegExp
      ? (c) => optionsEscape.test(c)
      : (c) => c === optionsEscape);

  let index = 0;
  let startIndex = 0;
  let current = '';
  let token = '';
  let c = '';
  let _prev = '';
  let _next = '';
  let bracketStack: string[] = [];
  let quoteChar = '';
  let iterator: IterableIterator<string> | undefined;
  let k: number;
  return {
    get input(): string {
      return input;
    },

    get curIndex() {
      return index - 1;
    },

    get startIndex() {
      return startIndex;
    },

    get current(): string {
      return current;
    },

    reset() {
      index = 0;
      startIndex = 0;
      current = '';
      token = '';
      bracketStack = [];
      quoteChar = '';
      _prev = '';
      _next = '';
    },

    next() {
      startIndex = index;
      if (index >= len)
        return null;
      while (index < len) {
        _prev = c;
        c = input.charAt(index++);
        _next = input.charAt(index);

        // Escaping
        if (escapeFn(c, _prev, _next)) {
          token += _next;
          index++;
          continue;
        }

        // Brackets
        k = bracketChars.indexOf(c);
        if (k >= 0) {
          if (k % 2 === 0) {
            bracketStack.push(bracketChars.charAt(k + 1));
            if (keepBrackets == null || keepBrackets(c, _prev, _next))
              token += c;
            continue;
          }
          if (!bracketStack.length || bracketStack[bracketStack.length - 1] !== c)
            throw new SyntaxError('Closure of brackets was used invalid.');
          bracketStack.pop();
          if (keepBrackets == null || keepBrackets(c, _prev, _next))
            token += c;
          continue;
        }
        if (bracketStack.length) {
          token += c;
          continue;
        }

        // Quotes
        if (quoteChars.includes(c)) {
          if (quoteChar === c) {
            if (keepQuotes == null || keepQuotes(c, _prev, _next))
              token += c;
            quoteChar = '';
            continue;
          }
          quoteChar = c;
        }
        if (quoteChar) {
          if (quoteChar !== c || (keepQuotes == null || keepQuotes(c, _prev, _next)))
            token += c;
          continue;
        }

        if (delimiters && (
          (typeof delimiters === 'string' && delimiters.includes(c)) ||
          (delimiters instanceof RegExp && delimiters.test(c))
        )) {
          current = token;
          token = keepDelimiters && keepDelimiters(c, _prev, _next) ? c : '';
          if (current || emptyTokens)
            return current;
          continue;
        }

        token += c;
      }

      if (bracketStack.length)
        throw new SyntaxError(`Bracket (${bracketStack.pop()}) is not closed`);

      current = token;
      token = '';
      return current;
    },

    all(): string[] {
      const arr: string[] = [];
      for (const x of this) {
        arr.push(x || '');
      }
      return arr;
    },

    join(separator?: string): string {
      let output = '';
      let i = 0;
      for (const x of this) {
        output += (separator && i++ ? separator : '') + x;
      }
      return output;
    },

    [Symbol.iterator]() {
      const next = this.next;
      if (!iterator) {
        iterator = {
          next() {
            const value = next();
            return {
              done: value == null,
              value: value || ''
            }
          },
          [Symbol.iterator]() {
            return this;
          }
        }
      }
      return iterator;
    }
  };
}

export namespace tokenize {
  export const DEFAULT_BRACKETS = '[]()';
  export const DEFAULT_QUOTES = '"\'`';
  export const DEFAULT_DELIMITERS = /\W/
}
