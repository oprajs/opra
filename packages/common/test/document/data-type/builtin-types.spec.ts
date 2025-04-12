import { ApiDocument, BigintType } from '@opra/common';
import { expect } from 'expect';
import { ComparisonExpression } from '../../../src/filter/ast/index.js';
import { TestHttpApiDocument } from '../../_support/test-http-api/index.js';

describe('Built-in types', () => {
  let doc: ApiDocument;

  before(async () => {
    doc = await TestHttpApiDocument.create();
  });

  /**
   * Primitive Types
   */

  describe('"any"', () => {
    it('Should decode', async () => {
      const dt = doc.node.getSimpleType('any');
      expect(dt).toBeDefined();
      const decode = dt.generateCodec('decode');
      expect(decode('t')).toStrictEqual('t');
      expect(decode(1)).toStrictEqual(1);
    });

    it('Should encode', async () => {
      const dt = doc.node.getSimpleType('any');
      const encode = dt.generateCodec('decode');
      expect(encode('t')).toStrictEqual('t');
      expect(encode(1)).toStrictEqual(1);
    });
  });

  describe('"bigint"', () => {
    it('Should decode', async () => {
      const dt = doc.node.getSimpleType('bigint');
      expect(dt).toBeDefined();
      const decode = dt.generateCodec('decode');
      expect(decode('123')).toStrictEqual(BigInt(123));
      expect(decode(1)).toStrictEqual(BigInt(1));
    });

    it('Should encode', async () => {
      const dt = doc.node.getSimpleType('bigint');
      const encode = dt.generateCodec('decode');
      expect(encode(123)).toStrictEqual(BigInt(123));
    });

    it('Should validate "minValue"', async () => {
      const dt = doc.node.getSimpleType('bigint');
      expect(dt).toBeDefined();
      const decode = dt.generateCodec<BigintType>('decode', null, {
        minValue: 10,
      });
      expect(() => decode(9)).toThrow(
        'Value must be greater than or equal to 10',
      );
    });

    it('Should validate "maxValue"', async () => {
      const dt = doc.node.getSimpleType('bigint');
      expect(dt).toBeDefined();
      const decode = dt.generateCodec('decode', null, { maxValue: 10 });
      expect(() => decode(11)).toThrow(
        'Value must be lover than or equal to 10',
      );
    });
  });

  describe('"boolean"', () => {
    it('Should decode', async () => {
      const dt = doc.node.getSimpleType('boolean');
      const decode = dt.generateCodec('decode');
      expect(decode('t')).toStrictEqual(true);
      expect(decode(true)).toStrictEqual(true);
      expect(decode(false)).toStrictEqual(false);
    });

    it('Should encode', async () => {
      const dt = doc.node.getSimpleType('boolean');
      const encode = dt.generateCodec('encode');
      expect(encode('t')).toStrictEqual(true);
      expect(encode(true)).toStrictEqual(true);
      expect(encode(false)).toStrictEqual(false);
    });
  });

  describe('"integer"', () => {
    it('Should decode', async () => {
      const dt = doc.node.getSimpleType('integer');
      const decode = dt.generateCodec('decode');
      expect(decode('123')).toStrictEqual(123);
      expect(decode(123)).toStrictEqual(123);
    });

    it('Should encode', async () => {
      const dt = doc.node.getSimpleType('integer');
      const encode = dt.generateCodec('encode');
      expect(encode('123')).toStrictEqual(123);
      expect(encode(123)).toStrictEqual(123);
    });

    it('Should validate value', async () => {
      const dt = doc.node.getSimpleType('integer');
      expect(dt).toBeDefined();
      const decode = dt.generateCodec('decode');
      expect(() => decode('abc')).toThrow('must be a valid integer value');
      expect(() => decode('abc')).toThrow('must be a valid integer value');
    });

    it('Should validate "minValue"', async () => {
      const dt = doc.node.getSimpleType('integer');
      expect(dt).toBeDefined();
      const decode = dt.generateCodec('decode', null, { minValue: 10 });
      expect(() => decode(9)).toThrow(
        'Value must be greater than or equal to 10',
      );
    });

    it('Should validate "maxValue"', async () => {
      const dt = doc.node.getSimpleType('integer');
      expect(dt).toBeDefined();
      const decode = dt.generateCodec('decode', null, { maxValue: 10 });
      expect(() => decode(11)).toThrow(
        'Value must be lover than or equal to 10',
      );
    });
  });

  describe('"null"', () => {
    it('Should decode', async () => {
      const dt = doc.node.getSimpleType('null');
      const decode = dt.generateCodec('decode');
      expect(decode(null)).toStrictEqual(null);
      expect(() => decode('')).toThrow('must be null');
    });

    it('Should encode', async () => {
      const dt = doc.node.getSimpleType('null');
      const encode = dt.generateCodec('encode');
      expect(encode(null)).toStrictEqual(null);
      expect(() => encode('')).toThrow('must be null');
    });
  });

  describe('"number"', () => {
    it('Should decode', async () => {
      const dt = doc.node.getSimpleType('number');
      const decode = dt.generateCodec('decode');
      expect(decode('123.12')).toStrictEqual(123.12);
      expect(decode(123.12)).toStrictEqual(123.12);
    });

    it('Should encode', async () => {
      const dt = doc.node.getSimpleType('number');
      const encode = dt.generateCodec('encode');
      expect(encode('123.12')).toStrictEqual(123.12);
      expect(encode(123.12)).toStrictEqual(123.12);
    });

    it('Should validate "minValue"', async () => {
      const dt = doc.node.getSimpleType('number');
      expect(dt).toBeDefined();
      const decode = dt.generateCodec('decode', null, { minValue: 10 });
      expect(() => decode(9)).toThrow(
        'Value must be greater than or equal to 10',
      );
    });

    it('Should validate "maxValue"', async () => {
      const dt = doc.node.getSimpleType('number');
      expect(dt).toBeDefined();
      const decode = dt.generateCodec('decode', null, { maxValue: 10 });
      expect(() => decode(11)).toThrow(
        'Value must be lover than or equal to 10',
      );
    });
  });

  describe('"object"', () => {
    it('Should decode', async () => {
      const dt = doc.node.getComplexType('object');
      const decode = dt.generateCodec('decode');
      expect(decode('{"a": 1}')).toEqual({ a: 1 });
      expect(decode({ a: 1 })).toEqual({ a: 1 });
    });

    it('Should encode', async () => {
      const dt = doc.node.getComplexType('object');
      const encode = dt.generateCodec('encode');
      expect(encode('{"a": 1}')).toEqual({ a: 1 });
      expect(encode({ a: 1 })).toEqual({ a: 1 });
    });
  });

  describe('"string"', () => {
    it('Should decode', async () => {
      const dt = doc.node.getSimpleType('string');
      const decode = dt.generateCodec('decode');
      expect(decode('john')).toStrictEqual('john');
      expect(decode(1)).toStrictEqual('1');
    });

    it('Should encode', async () => {
      const dt = doc.node.getSimpleType('string');
      const encode = dt.generateCodec('encode');
      expect(encode('john')).toStrictEqual('john');
      expect(encode(1)).toStrictEqual('1');
    });

    it('Should validate "minLength"', async () => {
      const dt = doc.node.getSimpleType('string');
      expect(dt).toBeDefined();
      const decode = dt.generateCodec('decode', null, { minLength: 5 });
      expect(() => decode('abc')).toThrow('length must be at least 5');
    });

    it('Should validate "maxLength"', async () => {
      const dt = doc.node.getSimpleType('string');
      expect(dt).toBeDefined();
      const decode = dt.generateCodec('decode', null, { maxLength: 3 });
      expect(() => decode('abcef')).toThrow(
        'The length of Value must be at most 3',
      );
    });

    it('Should validate "pattern"', async () => {
      const dt = doc.node.getSimpleType('string');
      expect(dt).toBeDefined();
      const decode = dt.generateCodec('decode', null, {
        pattern: /\d+/,
        patternName: 'Decimal',
      });
      expect(decode('123')).toStrictEqual('123');
      expect(() => decode('abcef')).toThrow('must match Decimal format');
    });
  });

  /**
   * Extended Types
   */

  describe('"datestring"', () => {
    it('Should decode', async () => {
      const dt = doc.node.getSimpleType('datestring');
      const decode = dt.generateCodec('decode');
      expect(decode('2020-01-02T10:30:00')).toStrictEqual('2020-01-02');
      expect(decode('2020-02')).toStrictEqual('2020-02');
      expect(decode('2020')).toStrictEqual('2020');
    });

    it('Should encode', async () => {
      const dt = doc.node.getSimpleType('datestring');
      const encode = dt.generateCodec('encode');
      expect(encode(new Date('2020-01-02T00:00:00'))).toStrictEqual(
        '2020-01-02',
      );
    });

    it('Should validate "minValue"', async () => {
      const dt = doc.node.getSimpleType('datestring');
      const decode = dt.generateCodec('decode', null, {
        minValue: '2021-02-10',
      });
      expect(decode('2022-01-02T10:30:00')).toStrictEqual('2022-01-02');
      expect(() => decode('2020-01-02T10:30:00')).toThrow(
        'Value must be greater than or equal to',
      );
    });

    it('Should validate "maxValue"', async () => {
      const dt = doc.node.getSimpleType('datestring');
      const decode = dt.generateCodec('decode', null, {
        maxValue: '2021-02-10',
      });
      expect(decode('2020-01-02T10:30:00')).toStrictEqual('2020-01-02');
      expect(() => decode('2022-01-02T10:30:00')).toThrow(
        'Value must be lover than or equal to',
      );
    });
  });

  describe('"datetimestring"', () => {
    it('Should decode', async () => {
      const dt = doc.node.getSimpleType('datetimestring');
      const decode = dt.generateCodec('decode');
      expect(decode('2020-01-02T10:30:00')).toStrictEqual(
        '2020-01-02T10:30:00',
      );
      expect(decode('2020-01-02T10:30')).toStrictEqual('2020-01-02T10:30');
      expect(decode('2020-02')).toStrictEqual('2020-02');
      expect(decode('2020')).toStrictEqual('2020');
    });

    it('Should encode', async () => {
      const dt = doc.node.getSimpleType('datetimestring');
      const encode = dt.generateCodec('encode');
      expect(encode(new Date('2020-01-02T00:00:00'))).toStrictEqual(
        '2020-01-02T00:00:00',
      );
    });

    it('Should validate "minValue"', async () => {
      const dt = doc.node.getSimpleType('datetimestring');
      const decode = dt.generateCodec('decode', null, {
        minValue: '2021-02-10',
      });
      expect(decode('2022-01-02T10:30:00')).toStrictEqual(
        '2022-01-02T10:30:00',
      );
      expect(() => decode('2020-01-02T10:30:00')).toThrow(
        'Value must be greater than or equal to',
      );
    });

    it('Should validate "maxValue"', async () => {
      const dt = doc.node.getSimpleType('datetimestring');
      const decode = dt.generateCodec('decode', null, {
        maxValue: '2021-02-10',
      });
      expect(decode('2020-01-02T10:30:00')).toStrictEqual(
        '2020-01-02T10:30:00',
      );
      expect(() => decode('2022-01-02T10:30:00')).toThrow(
        'Value must be lover than or equal to',
      );
    });
  });

  describe('"base64"', () => {
    it('Should decode', async () => {
      const dt = doc.node.getSimpleType('base64');
      const decode = dt.generateCodec('decode');
      expect(decode('dGhpcyBpcyBhIHRlc3Qgc3RyaW5n')).toStrictEqual(
        'dGhpcyBpcyBhIHRlc3Qgc3RyaW5n',
      );
    });

    it('Should encode', async () => {
      const dt = doc.node.getSimpleType('base64');
      const encode = dt.generateCodec('encode');
      expect(encode('dGhpcyBpcyBhIHRlc3Qgc3RyaW5n')).toStrictEqual(
        'dGhpcyBpcyBhIHRlc3Qgc3RyaW5n',
      );
    });
  });

  describe('"date"', () => {
    it('Should decode', async () => {
      const dt = doc.node.getSimpleType('date');
      const decode = dt.generateCodec('decode');
      expect(decode('2020-01-02T10:30:00')).toStrictEqual(
        new Date('2020-01-02T00:00:00'),
      );
      expect(decode('2020-01-02')).toStrictEqual(
        new Date('2020-01-02T00:00:00'),
      );
      expect(decode('2020')).toStrictEqual(new Date('2020-01-01T00:00:00'));
      expect(decode('2020-01-02T10:30:00')).toStrictEqual(
        new Date('2020-01-02T00:00:00'),
      );
    });

    it('Should encode', async () => {
      const dt = doc.node.getSimpleType('date');
      const encode = dt.generateCodec('encode');
      expect(encode(new Date('2020-01-02T00:00:00'))).toStrictEqual(
        '2020-01-02',
      );
    });

    it('Should decode() validate "minValue"', async () => {
      const dt = doc.node.getSimpleType('date');
      const decode = dt.generateCodec('decode', null, {
        minValue: '2021-02-10',
      });
      expect(decode('2022-01-02T10:30:00')).toStrictEqual(
        new Date('2022-01-02T00:00:00'),
      );
      expect(() => decode('2020-01-02T10:30:00')).toThrow(
        'Value must be greater than or equal to',
      );
    });

    it('Should decode() validate "maxValue"', async () => {
      const dt = doc.node.getSimpleType('date');
      const decode = dt.generateCodec('decode', null, {
        maxValue: '2021-02-10',
      });
      expect(decode('2020-01-02T10:30:00')).toStrictEqual(
        new Date('2020-01-02T00:00:00'),
      );
      expect(() => decode('2022-01-02T10:30:00')).toThrow(
        'Value must be lover than or equal to',
      );
    });

    it('Should encode() validate "minValue"', async () => {
      const dt = doc.node.getSimpleType('date');
      const encode = dt.generateCodec('encode', null, {
        minValue: '2021-02-10',
      });
      expect(encode(new Date('2022-01-02T00:00:00'))).toStrictEqual(
        '2022-01-02',
      );
      expect(() => encode(new Date('2020-01-02T00:00:00'))).toThrow(
        'Value must be greater than or equal to',
      );
    });

    it('Should encode() validate "maxValue"', async () => {
      const dt = doc.node.getSimpleType('date');
      const encode = dt.generateCodec('encode', null, {
        maxValue: '2021-02-10',
      });
      expect(encode(new Date('2020-01-02T00:00:00'))).toStrictEqual(
        '2020-01-02',
      );
      expect(() => encode(new Date('2022-01-02T00:00:00'))).toThrow(
        'Value must be lover than or equal to',
      );
    });
  });

  describe('"datetime"', () => {
    it('Should decode', async () => {
      const dt = doc.node.getSimpleType('datetime');
      const decode = dt.generateCodec('decode');
      expect(decode('2020-01-02T10:30:45')).toStrictEqual(
        new Date('2020-01-02T10:30:45'),
      );
      expect(decode('2020-01-02')).toStrictEqual(
        new Date('2020-01-02T00:00:00'),
      );
      expect(decode('2020')).toStrictEqual(new Date('2020-01-01T00:00:00'));
      expect(decode('2020-01-02T10:30:00')).toStrictEqual(
        new Date('2020-01-02T10:30:00'),
      );
    });

    it('Should encode', async () => {
      const dt = doc.node.getSimpleType('datetime');
      const encode = dt.generateCodec('encode');
      expect(encode(new Date('2020-01-02T10:30:45'))).toStrictEqual(
        '2020-01-02T10:30:45',
      );
    });

    it('Should decode() validate "minValue"', async () => {
      const dt = doc.node.getSimpleType('datetime');
      const decode = dt.generateCodec('decode', null, {
        minValue: '2021-02-10',
      });
      expect(decode('2022-01-02T10:30:00')).toStrictEqual(
        new Date('2022-01-02T10:30:00'),
      );
      expect(() => decode('2020-01-02T10:30:00')).toThrow(
        'Value must be greater than or equal to',
      );
    });

    it('Should decode() validate "maxValue"', async () => {
      const dt = doc.node.getSimpleType('datetime');
      const decode = dt.generateCodec('decode', null, {
        maxValue: '2021-02-10',
      });
      expect(decode('2020-01-02T10:30:00')).toStrictEqual(
        new Date('2020-01-02T10:30:00'),
      );
      expect(() => decode('2022-01-02T10:30:00')).toThrow(
        'Value must be lover than or equal to',
      );
    });

    it('Should encode() validate "minValue"', async () => {
      const dt = doc.node.getSimpleType('datetime');
      const encode = dt.generateCodec('encode', null, {
        minValue: '2021-02-10',
      });
      expect(encode(new Date('2022-01-02T00:00:00'))).toStrictEqual(
        '2022-01-02T00:00:00',
      );
      expect(() => encode(new Date('2020-01-02T00:00:00'))).toThrow(
        'Value must be greater than or equal to',
      );
    });

    it('Should encode() validate "maxValue"', async () => {
      const dt = doc.node.getSimpleType('datetime');
      const encode = dt.generateCodec('encode', null, {
        maxValue: '2021-02-10',
      });
      expect(encode(new Date('2020-01-02T00:00:00'))).toStrictEqual(
        '2020-01-02T00:00:00',
      );
      expect(() => encode(new Date('2022-01-02T00:00:00'))).toThrow(
        'Value must be lover than or equal to',
      );
    });
  });

  describe('"email"', () => {
    it('Should decode', async () => {
      const dt = doc.node.getSimpleType('email');
      const decode = dt.generateCodec('decode');
      expect(decode('me@domain.com')).toStrictEqual('me@domain.com');
    });
  });

  describe('"fieldPath"', () => {
    it('Should decode', async () => {
      const dt = doc.node.getSimpleType('fieldPath');
      const decode = dt.generateCodec(
        'decode',
        { documentElement: doc },
        { dataType: 'customer' },
      );
      expect(decode('address.countrycode')).toStrictEqual(
        'address.countryCode',
      );
      expect(() => decode('address.xyz')).toThrow('Unknown field');
    });
  });

  describe('"filter"', () => {
    it('Should decode', async () => {
      const dt = doc.node.getSimpleType('filter');
      const decode = dt.generateCodec(
        'decode',
        { documentElement: doc },
        {
          dataType: 'customer',
          rules: {
            'address.city': { operators: ['=', '!='] },
          },
        },
      );
      expect(decode('address.city="Antalya"')).toBeInstanceOf(
        ComparisonExpression,
      );
      expect(() => decode('address.xyz=1')).toThrow('Unknown field');
    });
  });

  describe('"time"', () => {
    it('Should decode', async () => {
      const dt = doc.node.getSimpleType('time');
      const decode = dt.generateCodec('decode');
      expect(decode('10:30:45')).toStrictEqual('10:30:45');
      expect(decode('10:30')).toStrictEqual('10:30');
    });

    it('Should encode', async () => {
      const dt = doc.node.getSimpleType('time');
      const encode = dt.generateCodec('encode');
      expect(encode('10:30:45')).toStrictEqual('10:30:45');
      expect(encode('10:30:00')).toStrictEqual('10:30:00');
    });

    it('Should validate "minValue"', async () => {
      const dt = doc.node.getSimpleType('time');
      const decode = dt.generateCodec('decode', null, { minValue: '10:00:00' });
      expect(decode('10:30:45')).toStrictEqual('10:30:45');
      expect(() => decode('09:30:45')).toThrow(
        'Value must be greater than or equal to',
      );
    });

    it('Should validate "maxValue"', async () => {
      const dt = doc.node.getSimpleType('time');
      const decode = dt.generateCodec('decode', null, { maxValue: '10:00:00' });
      expect(decode('09:30:45')).toStrictEqual('09:30:45');
      expect(() => decode('10:30:45')).toThrow(
        'Value must be lover than or equal to',
      );
    });
  });

  describe('"url"', () => {
    it('Should decode', async () => {
      const dt = doc.node.getSimpleType('url');
      const decode = dt.generateCodec('decode');
      expect(decode('http://www.domain.com')).toStrictEqual(
        'http://www.domain.com',
      );
      expect(() => decode('domain')).toThrow('must be a valid URL');
    });
  });

  describe('"uuid"', () => {
    it('Should decode', async () => {
      const dt = doc.node.getSimpleType('uuid');
      const decode = dt.generateCodec('decode');
      expect(decode('3c6aed92-0a89-11ee-be56-0242ac120002')).toStrictEqual(
        '3c6aed92-0a89-11ee-be56-0242ac120002',
      );
      expect(() => decode('3c6aed92-0a89')).toThrow('must be a valid UUID');
    });

    it('Should define UUID version', async () => {
      const dt = doc.node.getSimpleType('uuid');
      const decode = dt.generateCodec('decode', null, { version: 4 });
      expect(() => decode('3c6aed92-0a89-11ee-be56-0242ac120002')).toThrow(
        'must be a valid UUID v4',
      );
    });
  });
});
