import { ApiDocument } from '@opra/common';
import { expect } from 'expect';
import { TestHttpApiDocument } from '../../../_support/test-http-api/index.js';

describe('common:Builtin type: object', () => {
  let doc: ApiDocument;

  before(async () => {
    doc = await TestHttpApiDocument.create();
  });

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
