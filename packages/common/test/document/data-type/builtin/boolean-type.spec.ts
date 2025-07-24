import { ApiDocument } from '@opra/common';
import { expect } from 'expect';
import { TestHttpApiDocument } from '../../../_support/test-http-api/index.js';

describe('common:Builtin type: boolean', () => {
  let doc: ApiDocument;

  before(async () => {
    doc = await TestHttpApiDocument.create();
  });

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
