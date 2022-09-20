import {matcherHint, MatcherHintOptions,printExpected, printReceived} from 'jest-matcher-utils';

declare global {
  namespace jest {
    interface Expect {
      objectHaveKeysOnly(expected: string[]);

      objectMatches(expected: Record<string, any>);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Matchers<R> {
      toBeSorted(compareFn?: (a, b) => number);

      toBeGreaterThanAny(expected: number | bigint | string | Date);

      toBeGreaterThanOrEqualAny(expected: number | bigint | string | Date);

      toBeLessThanAny(expected: number | bigint | string | Date);

      toBeLessThanOrEqualAny(expected: number | bigint | string | Date);
    }

    interface InverseAsymmetricMatchers {
      objectHaveKeysOnly(expected: string[]);

      objectMatches(expected: Record<string, any>);

      toBeSorted(compareFn?: (a, b) => number);

      toBeGreaterThanAny(expected: number | bigint | string | Date);

      toBeGreaterThanOrEqualAny(expected: number | bigint | string | Date);

      toBeLessThanAny(expected: number | bigint | string | Date);

      toBeLessThanOrEqualAny(expected: number | bigint | string | Date);
    }

  }
}

expect.extend({
  objectHaveKeysOnly(received, expected: string[]) {
    if (typeof received === 'object') {
      const keys = Array.isArray(expected) ? expected : Object.keys(expected);
      const additionalKeys = Object.keys(received).filter(x => !keys.includes(x));
      if (additionalKeys.length) {
        return {
          pass: false,
          message: () => `Object contains unexpected additional keys (${additionalKeys})`
        };
      }
    }
    return {actual: received, pass: true, message: () => ''};
  },
  objectMatches(received, expected: Record<string, any>) {
    if (typeof received === 'object') {
      const keys = Object.keys(expected);
      for (const k of keys) {
        const v = k.split('.').reduce((a, b) => a[b], received);
        try {
          const matching = expected[k];
          if (typeof matching === 'function')
            matching(v);
          else expect(v).toEqual(matching);
        } catch (e: any) {
          return {
            pass: false,
            message: () => `${k} does not match: ${e.message}`
          };
        }
      }
    }
    return {actual: received, pass: true, message: () => ''};
  },
  toBeSorted(received, compareFn?: (a, b) => number) {
    let pass = Array.isArray(received);
    let message;
    if (pass) {
      const sorted = [...received];
      sorted.sort(compareFn);
      try {
        expect(received).toEqual(sorted);
      } catch (e) {
        pass = false;
        message = () => 'Array items is not sorted as expected';
      }
    }
    return {
      actual: received,
      message,
      pass
    };
  },
  toBeGreaterThanAny(received, expected: number | bigint | string | Date) {
    return compare('toBeGreaterThan', {
      isNot: this.isNot,
      promise: this.promise
    }, received, expected, '>', () => received > expected);
  },
  toBeGreaterThanOrEqualAny(received, expected: number | bigint | string | Date) {
    return compare('toBeGreaterThanOrEqual', {
      isNot: this.isNot,
      promise: this.promise
    }, received, expected, '>=', () => received >= expected);
  },
  toBeLessThanAny(received, expected: number | bigint | string | Date) {
    return compare('toBeLessThan', {
      isNot: this.isNot,
      promise: this.promise
    }, received, expected, '<', () => received < expected);
  },
  toBeLessThanOrEqualAny(received, expected: number | bigint | string | Date) {
    return compare('toBeLessThanOrEqual', {
      isNot: this.isNot,
      promise: this.promise
    }, received, expected, '<=', () => received <= expected);
  }
});

function compare(matcherName,
                 options: MatcherHintOptions,
                 received,
                 expected,
                 operator: string,
                 fn: (a, b) => boolean) {
  const pass = fn(received, expected);
  const message = () =>
    matcherHint(matcherName, undefined, undefined, options) +
    '\n\n' +
    `Expected:${options.isNot ? ' not' : ''} ${operator} ${printExpected(expected)}\n` +
    `Received:${options.isNot ? '    ' : ''}   ${printReceived(received)}`;
  return {message, pass};
}
