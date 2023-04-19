export function normalizePath(p?: string, noLeadingSlash?: boolean): string {
  if (!p)
    return '';
  while (noLeadingSlash && p.startsWith('/'))
    p = p.substring(1);
  while (p.endsWith('/'))
    p = p.substring(0, p.length - 1);
  return p;
}

export function joinPath(...p: string[]): string {
  const out: string[] = [];
  let s: string;
  for (let i = 0, l = p.length; i < l; i++) {
    s = normalizePath(p[i], i > 0);
    if (s)
      out.push(s);
  }
  return out.join('/');
}

