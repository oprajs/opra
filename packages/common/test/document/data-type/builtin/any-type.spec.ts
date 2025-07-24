import { ApiDocument } from '@opra/common';
import { expect } from 'expect';
import { TestHttpApiDocument } from '../../../_support/test-http-api/index.js';

describe('common:Builtin type: any', () => {
  let doc: ApiDocument;

  before(async () => {
    doc = await TestHttpApiDocument.create();
  });

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
