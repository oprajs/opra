const colorReset = "\u001B[0m";
const colorFgYellow = "\u001B[33m";

export function printErrors(errors: any[]): string {
  let i = 1;
  return errors.map((e) => {
    let j = 0;
    return '    ' + colorFgYellow + (i++) + '-' + colorReset+
        Object.keys(e).map(k =>
            (j++ ? '        ' : '  ') +
            k + ': ' + e[k]).join('\n')
  }).join('\n');
}
