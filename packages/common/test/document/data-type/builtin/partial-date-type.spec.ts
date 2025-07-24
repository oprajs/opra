import { ApiDocument } from '@opra/common';
import { expect } from 'expect';
import { TestHttpApiDocument } from '../../../_support/test-http-api/index.js';

describe('common:Builtin type: partialdate', () => {
  let doc: ApiDocument;

  before(async () => {
    doc = await TestHttpApiDocument.create();
  });

  it('Should generate decoder (from string)', async () => {
    const dt = doc.node.getSimpleType('partialdate');
    const decode = dt.generateCodec('decode');

    expect(decode('2020-01-02T15:32:18')).toStrictEqual('2020-01-02T15:32:18');
    expect(decode('2020-01-02T15:32')).toStrictEqual('2020-01-02T15:32');
    expect(decode('2020-01-02 15:32')).toStrictEqual('2020-01-02 15:32');
    expect(decode('2020-01-02')).toStrictEqual('2020-01-02');
    expect(decode('2020-01')).toStrictEqual('2020-01');
    expect(decode('2020')).toStrictEqual('2020');
  });

  it('Should generate decoder (from Date)', async () => {
    const dt = doc.node.getSimpleType('partialdate');
    const decode = dt.generateCodec('decode');

    expect(decode(new Date('2020-01-02T15:32:18'))).toStrictEqual(
      '2020-01-02T15:32:18',
    );
    expect(decode(new Date('2020-01-02T15:32:00'))).toStrictEqual(
      '2020-01-02T15:32',
    );
    expect(decode(new Date('2020-01-02T00:00:00'))).toStrictEqual('2020-01-02');
  });
});
