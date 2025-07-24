import { ApiDocument } from '@opra/common';
import { expect } from 'expect';
import { TestHttpApiDocument } from '../../../_support/test-http-api/index.js';

describe('common:Builtin type: uuid', () => {
  let doc: ApiDocument;

  before(async () => {
    doc = await TestHttpApiDocument.create();
  });

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
