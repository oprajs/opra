import colors from 'ansi-colors';
import { expect } from 'expect';
import {
  matcherHint,
  type MatcherHintOptions,
  printExpected,
  printReceived,
} from 'jest-matcher-utils';

declare module 'expect' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Matchers<R> {
    toBeArray();

    toBeGreaterThanAny(expected: number | bigint | string | Date);

    toBeGreaterThanOrEqualAny(expected: number | bigint | string | Date);

    toBeLessThanAny(expected: number | bigint | string | Date);

    toBeLessThanOrEqualAny(expected: number | bigint | string | Date);
  }

  interface InverseAsymmetricMatchers {
    toBeGreaterThanAny(expected: number | bigint | string | Date);

    toBeGreaterThanOrEqualAny(expected: number | bigint | string | Date);

    toBeLessThanAny(expected: number | bigint | string | Date);

    toBeLessThanOrEqualAny(expected: number | bigint | string | Date);
  }
}

declare global {
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Matchers<R> {
      toBeArray();

      toBeGreaterThanAny(expected: number | bigint | string | Date);

      toBeGreaterThanOrEqualAny(expected: number | bigint | string | Date);

      toBeLessThanAny(expected: number | bigint | string | Date);

      toBeLessThanOrEqualAny(expected: number | bigint | string | Date);
    }

    interface InverseAsymmetricMatchers {
      toBeGreaterThanAny(expected: number | bigint | string | Date);

      toBeGreaterThanOrEqualAny(expected: number | bigint | string | Date);

      toBeLessThanAny(expected: number | bigint | string | Date);

      toBeLessThanOrEqualAny(expected: number | bigint | string | Date);
    }
  }
}

expect.extend({
  toHaveFields(received, expected: string[]) {
    const expectedKeys = (
      Array.isArray(expected) ? expected : Object.keys(expected)
    ).map(x => x.toLowerCase());
    const objectKeys = Object.keys(received).map(x => x.toLowerCase());
    const filteredKeys = expectedKeys.filter(x => !objectKeys.includes(x));
    const pass = !filteredKeys.length === !this.isNot;
    if (!pass) {
      const message = () =>
        `Expects keys ${this.isNot ? 'not ' : ''}to contain: ${colors.yellow('' + expectedKeys)}\n` +
        `${this.isNot ? 'Unsolicited' : 'Missing'} fields: ${colors.yellow('' + filteredKeys)}\n`;
      return { message, pass: !!this.isNot };
    }
    return { actual: received, pass: !this.isNot, message: () => '' };
  },

  toHaveFieldsOnly(received, expected: string[]) {
    const expectedKeys = (
      Array.isArray(expected) ? expected : Object.keys(expected)
    ).map(x => x.toLowerCase());
    const objectKeys = Object.keys(received).map(x => x.toLowerCase());
    const filteredKeys = objectKeys.filter(x => !expectedKeys.includes(x));
    const pass = !filteredKeys.length === !this.isNot;
    if (!pass) {
      const message = () =>
        `${!this.isNot ? 'Do not expects' : 'Expects'} additional keys other than: ${colors.yellow('' + expectedKeys)}\n` +
        (filteredKeys
          ? `Additional keys received: ${colors.yellow('' + filteredKeys)}\n`
          : 'No additional keys received\n');
      return { message, pass };
    }
    return { actual: received, pass: !this.isNot, message: () => '' };
  },

  toBeArray(received) {
    if (Array.isArray(received)) {
      return { actual: received, pass: true, message: () => '' };
    }
    return {
      pass: false,
      message: () => 'Value is not an array',
    };
  },

  toBeGreaterThanAny(received, expected: number | bigint | string | Date) {
    return compare(
      'toBeGreaterThan',
      {
        isNot: this.isNot,
        promise: this.promise,
      },
      received,
      expected,
      '>',
      () => received > expected,
    );
  },
  toBeGreaterThanOrEqualAny(
    received,
    expected: number | bigint | string | Date,
  ) {
    return compare(
      'toBeGreaterThanOrEqual',
      {
        isNot: this.isNot,
        promise: this.promise,
      },
      received,
      expected,
      '>=',
      () => received >= expected,
    );
  },
  toBeLessThanAny(received, expected: number | bigint | string | Date) {
    return compare(
      'toBeLessThan',
      {
        isNot: this.isNot,
        promise: this.promise,
      },
      received,
      expected,
      '<',
      () => received < expected,
    );
  },
  toBeLessThanOrEqualAny(received, expected: number | bigint | string | Date) {
    return compare(
      'toBeLessThanOrEqual',
      {
        isNot: this.isNot,
        promise: this.promise,
      },
      received,
      expected,
      '<=',
      () => received <= expected,
    );
  },
});

function compare(
  matcherName,
  options: MatcherHintOptions,
  received,
  expected,
  operator: string,
  fn: (a, b) => boolean,
) {
  const pass = fn(received, expected);
  const message = () =>
    matcherHint(matcherName, undefined, undefined, options) +
    '\n\n' +
    `Expected:${options.isNot ? ' not' : ''} ${operator} ${printExpected(expected)}\n` +
    `Received:${options.isNot ? '    ' : ''}   ${printReceived(received)}`;
  return { message, pass };
}
