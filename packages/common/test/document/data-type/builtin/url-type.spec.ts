import { ApiDocument } from '@opra/common';
import { expect } from 'expect';
import { TestHttpApiDocument } from '../../../_support/test-http-api/index.js';

describe('common:Builtin type: url', () => {
  let doc: ApiDocument;

  before(async () => {
    doc = await TestHttpApiDocument.create();
  });

  it('Should decode', async () => {
    const dt = doc.node.getSimpleType('url');
    const decode = dt.generateCodec('decode');
    expect(decode('http://www.domain.com')).toStrictEqual(
      'http://www.domain.com',
    );
    expect(() => decode('domain')).toThrow('must be a valid URL');
  });
});
