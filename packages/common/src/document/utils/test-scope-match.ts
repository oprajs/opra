export function testScopeMatch(
  scope: string,
  pattern?: (string | RegExp) | (string | RegExp)[],
) {
  if (!(scope && pattern)) return true;
  if (Array.isArray(pattern)) {
    return pattern.some(x => {
      return typeof x === 'string' ? scope === x : x.test(scope);
    });
  }
  return typeof pattern === 'string' ? scope === pattern : pattern.test(scope);
}
