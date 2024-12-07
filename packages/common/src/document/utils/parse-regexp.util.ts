export function parseRegExp(
  str: string,
  options?: {
    includeFlags?: string;
    excludeFlags?: string;
  },
): RegExp {
  const i = str.lastIndexOf('/');
  if (str.startsWith('/') && i) {
    const s = str.substring(1, i);
    let flags = str.substring(i + 1);
    if (options?.includeFlags) {
      for (const f of options.includeFlags) if (!flags.includes(f)) flags += f;
    }
    if (options?.excludeFlags) {
      for (const f of options.excludeFlags) flags.replace(f, '');
    }
    return new RegExp(s, flags);
  }
  throw new TypeError(`"${str}" is not a valid RegExp string`);
}
