import { ApiDocument } from '@opra/common';
import { expect } from 'expect';
import { TestHttpApiDocument } from '../../../_support/test-http-api/index.js';

describe('common:Builtin type: fieldPath', () => {
  let doc: ApiDocument;

  before(async () => {
    doc = await TestHttpApiDocument.create();
  });

  it('Should decode', async () => {
    const dt = doc.node.getSimpleType('fieldPath');
    const decode = dt.generateCodec(
      'decode',
      { documentElement: doc },
      { dataType: 'customer' },
    );
    expect(decode('address.countrycode')).toStrictEqual('address.countryCode');
    expect(() => decode('address.xyz')).toThrow('Unknown field');
  });
});
