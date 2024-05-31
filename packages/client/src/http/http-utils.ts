export function urlPath(strings: string[], ...values: any[]) {
  let str = '';
  let i: number;
  for (i = 0; i < strings.length; i++) {
    str += strings[0] + encodeURIComponent(values[i]);
  }
  return str;
}
