import { ApiDocument } from '@opra/common';
import { expect } from 'expect';
import { TestHttpApiDocument } from '../../../_support/test-http-api/index.js';

describe('common:Builtin type: string', () => {
  let doc: ApiDocument;

  before(async () => {
    doc = await TestHttpApiDocument.create();
  });

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
