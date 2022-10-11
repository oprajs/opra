import { matcherHint, MatcherHintOptions, printExpected, printReceived } from 'jest-matcher-utils';

declare global {
  namespace jest {

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Matchers<R> {
      toContainKeys(expected: string[]);

      toContainAllKeys(expected: string[]);

      toBeArray();

      toBeSorted(compareFn?: (a, b) => number);

      toBeSortedBy(properties: string[])

      toBeGreaterThanAny(expected: number | bigint | string | Date);

      toBeGreaterThanOrEqualAny(expected: number | bigint | string | Date);

      toBeLessThanAny(expected: number | bigint | string | Date);

      toBeLessThanOrEqualAny(expected: number | bigint | string | Date);
    }

    interface InverseAsymmetricMatchers {

      toContainKeys(expected: string[]);

      toContainAllKeys(expected: string[]);

      toBeSorted(compareFn?: (a, b) => number);

      toBeSortedBy(properties: string[]);

      toBeGreaterThanAny(expected: number | bigint | string | Date);

      toBeGreaterThanOrEqualAny(expected: number | bigint | string | Date);

      toBeLessThanAny(expected: number | bigint | string | Date);

      toBeLessThanOrEqualAny(expected: number | bigint | string | Date);
    }

  }
}

expect.extend({

  toContainKeys(received, expected: string[]) {
    if (typeof received === 'object') {
      const keys = Array.isArray(expected) ? expected : Object.keys(expected);
      const additionalKeys = Object.keys(received).filter(x => !keys.includes(x));
      if (!Object.keys(received).find(x => keys.includes(x))) {
        return {
          pass: false,
          message: () => `Object contains unexpected additional keys (${additionalKeys})`
        };
      }
    }
    return {actual: received, pass: true, message: () => ''};
  },

  toContainAllKeys(received, expected: string[]) {
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

  toBeArray(received) {
    if (Array.isArray(received)) {
      return {actual: received, pass: true, message: () => ''};
    }
    return {
      pass: false,
      message: () => 'Value is not an array'
    };
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

  toBeSortedBy(received, properties: string[]) {
    const fieldsMap = properties.map(x => x.split('.'));
    const getValue = (obj: any, fieldMap: string[]) => {
      let v = obj;
      let i = 0;
      while (v && i < fieldMap.length) {
        v = v[fieldMap[i++]];
      }
      return v;
    }
    let pass = Array.isArray(received);
    let message;
    if (pass) {
      const sorted = [...received];
      sorted.sort((a, b) => {
        for (const sortField of fieldsMap) {
          const l = getValue(a, sortField);
          const r = getValue(b, sortField);
          if (l < r) return -1;
          if (l > r) return 1;
        }
        return 0;
      });
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
