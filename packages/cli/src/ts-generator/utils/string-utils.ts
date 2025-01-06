import jsStringEscape from 'js-string-escape';

export function wrapJSDocString(
  s: string,
  indent?: number,
  currentColumn?: number,
): string {
  const arr: string[] = (s || '')
    .split(/[ \n\r]/)
    .map((x: string, i: number, a: string[]) =>
      i < a.length - 1 ? x + ' ' : x,
    );
  return _printLines(arr, {
    indent,
    currentColumn,
    lineStart: '* ',
    lineEnd: '',
  });
}

export function wrapQuotedString(
  s: string,
  indent?: number,
  currentColumn?: number,
): string {
  const arr: string[] = jsStringEscape(s || '')
    .split(' ')
    .map((x: string, i: number, a: string[]) =>
      i < a.length - 1 ? x + ' ' : x,
    );
  return (
    "'" +
    _printLines(arr, {
      indent,
      currentColumn,
      lineStart: "'",
      lineEnd: "' +",
    }) +
    "'"
  );
}

export function wrapStringArray(
  arr: string[],
  indent?: number,
  currentColumn?: number,
): string {
  const ar1: string[] = arr.map(
    (x: string, i: number, a: string[]) =>
      "'" + x + "'" + (i < a.length - 1 ? ', ' : ''),
  );
  return '[' + _printLines(ar1, { indent, currentColumn }) + ']';
}

export function wrapTypeArray(
  arr: string[],
  indent?: number,
  currentColumn?: number,
): string {
  const ar1: string[] = arr.map(
    (x: string, i: number, a: string[]) => x + (i < a.length - 1 ? ' | ' : ''),
  );
  return _printLines(ar1, { indent, currentColumn });
}

function _printLines(
  arr: string[],
  opts: {
    indent?: number;
    currentColumn?: number;
    lineWidth?: number;
    lineStart?: string;
    lineEnd?: string;
  } = {},
): string {
  let s = '';
  let line = '';
  const indent = opts.indent || 0;
  let lineWidth = (opts.lineWidth || 90) - (opts.currentColumn || 0);
  const l = arr.length;
  const printLine = (eof: boolean): void => {
    s +=
      (s
        ? '\n' +
          ' '.repeat(indent || 0) +
          (opts.lineStart ? opts.lineStart : '')
        : '') +
      line +
      (!eof ? (opts.lineEnd ? opts.lineEnd : '') : '');
    line = '';
  };
  for (let i = 0; i < l; i++) {
    const x = arr[i];
    if (line && line.length + x.length > lineWidth) {
      lineWidth = (opts.lineWidth || 90) - indent;
      printLine(false);
    }
    line += x;
  }
  printLine(true);
  return s;
}
