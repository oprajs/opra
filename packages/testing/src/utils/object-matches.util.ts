export function objectMatches(received, expected: any) {
  _objectMatches(received, expected, '');
}

function _objectMatches(received, expected: any, path: string) {
  if (typeof received !== typeof expected)
    expect(typeof received).toStrictEqual('object');
  const keys = Object.keys(expected);
  for (const k of keys) {
    const rv = received[k];
    const ev = expected[k];
    if (ev instanceof RegExp) {
      try {
        expect(rv).toMatch(ev);
      } catch {
        throw new Error(`Property "${k}" does not match`);
      }
    } else if (ev && typeof ev === 'object') {
      _objectMatches(rv, ev, path ? path + '.' + k : k);
    } else {
      try {
        expect(rv).toEqual(ev);
      } catch {
        throw new Error(`Property "${k}" does not match`);
      }
    }
  }
}
