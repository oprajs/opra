import colors from "ansi-colors"
import { matcherHint, MatcherHintOptions, printExpected, printReceived } from 'jest-matcher-utils';

declare global {
  namespace jest {

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Matchers<R> {
      toHaveFields(expected: string[]);

      toHaveFieldsOnly(expected: string[]);

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

  toHaveFields(received, expected: string[]) {
    const expectedKeys = (Array.isArray(expected) ? expected : Object.keys(expected)).map(x => x.toLowerCase());
    const objectKeys = Object.keys(received).map(x => x.toLowerCase());
    const filteredKeys = expectedKeys.filter(x => !objectKeys.includes(x));
    const pass = !filteredKeys.length === !this.isNot;
    if (!pass) {
      const message = () =>
          `Expects keys ${this.isNot ? 'not ' : ''}to contain: ${colors.yellow('' + expectedKeys)}\n` +
          `${this.isNot ? 'Unsolicited' : 'Missing'} fields: ${colors.yellow('' + filteredKeys)}\n`;
      return {message, pass: !!this.isNot};
    }
    return {actual: received, pass: !this.isNot, message: () => ''};
  },

  toHaveFieldsOnly(received, expected: string[]) {
    const expectedKeys = (Array.isArray(expected) ? expected : Object.keys(expected)).map(x => x.toLowerCase());
    const objectKeys = Object.keys(received).map(x => x.toLowerCase());
    const filteredKeys = objectKeys.filter(x => !expectedKeys.includes(x));
    const pass = !filteredKeys.length === !this.isNot;
    if (!pass) {
      const message = () =>
          `${!this.isNot ? 'Do not expects' : 'Expects'} additional keys other than: ${colors.yellow('' + expectedKeys)}\n` +
          (filteredKeys ? `Additional keys received: ${colors.yellow('' + filteredKeys)}\n` :
              'No additional keys received\n');
      return {message, pass};
    }
    return {actual: received, pass: !this.isNot, message: () => ''};
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
    let pass = true;
    let message;
    if (pass) {
      const sorted = [...(received || [])];
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
    let pass = true;
    let message;
    if (pass) {
      const sorted = [...(received || [])];
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
