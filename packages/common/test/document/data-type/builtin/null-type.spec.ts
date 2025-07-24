import { ApiDocument } from '@opra/common';
import { expect } from 'expect';
import { TestHttpApiDocument } from '../../../_support/test-http-api/index.js';

describe('common:Builtin type: null', () => {
  let doc: ApiDocument;

  before(async () => {
    doc = await TestHttpApiDocument.create();
  });

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
