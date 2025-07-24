import { ApiDocument } from '@opra/common';
import { expect } from 'expect';
import { ComparisonExpression } from '../../../../src/filter/ast/index.js';
import { TestHttpApiDocument } from '../../../_support/test-http-api/index.js';

describe('common:Builtin type: filter', () => {
  let doc: ApiDocument;

  before(async () => {
    doc = await TestHttpApiDocument.create();
  });

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
