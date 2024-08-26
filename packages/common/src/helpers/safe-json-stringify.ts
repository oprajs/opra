export function safeJsonStringify(
  value: any,
  replacer?: (this: any, key: string, value: any) => any,
  space?: string | number,
): string {
  const seen = new WeakSet();
  return JSON.stringify(
    value,
    (k, v) => {
      if (v !== null && typeof v === 'object') {
        if (seen.has(v)) return;
        seen.add(v);
      }
      if (replacer) return replacer(k, v);
      return v;
    },
    space,
  );
}
