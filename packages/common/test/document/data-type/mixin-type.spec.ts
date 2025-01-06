import 'reflect-metadata';
import {
  ApiDocument,
  ApiDocumentFactory,
  MixinType,
  OpraSchema,
} from '@opra/common';
import { Country, Note, Record } from 'customer-mongo/models';
import { TestHttpApiDocument } from '../../_support/test-http-api/index.js';

describe('MixinType', () => {
  let doc: ApiDocument;

  beforeAll(async () => {
    const baseDoc = await TestHttpApiDocument.create();
    doc = await ApiDocumentFactory.createDocument({
      spec: OpraSchema.SpecVersion,
      references: {
        base: baseDoc,
      },
      types: [
        MixinType(Record, Country, { name: 'MixinType1' }),
        MixinType(Record, Country, Note, { name: 'MixinType2' }),
      ],
    });
  });

  it('Should create MixinType with two types', async () => {
    const dt = doc.node.getMixinType('MixinType1');
    expect(dt).toBeDefined();
    expect(dt.name).toEqual('MixinType1');
    expect(dt.types.length).toEqual(2);
    expect(dt.types[0].name).toEqual('Record');
    expect(dt.types[1].name).toEqual('Country');
    expect(dt.findField('_id')).toBeDefined();
    expect(dt.findField('phoneCode')).toBeDefined();
  });

  it('Should create MixinType with three types', async () => {
    const dt = doc.node.getMixinType('MixinType2');
    expect(dt).toBeDefined();
    expect(dt.name).toEqual('MixinType2');
    expect(dt.types.length).toEqual(3);
    expect(dt.types[0].name).toEqual('Record');
    expect(dt.types[1].name).toEqual('Country');
    expect(dt.types[2].name).toEqual('Note');
    expect(dt.findField('_id')).toBeDefined();
    expect(dt.findField('phoneCode')).toBeDefined();
    expect(dt.findField('text')).toBeDefined();
  });

  it('Should _generateSchema() return ValGen schema', async () => {
    const dt = doc.node.getMixinType('MixinType2');
    const x: any = (dt as any)._generateSchema('decode', {});
    expect(x).toBeDefined();
    expect(Object.keys(x)).toStrictEqual([
      '_id',
      'deleted',
      'createdAt',
      'updatedAt',
      'code',
      'name',
      'phoneCode',
      'title',
      'text',
      'rank',
      'largeContent',
    ]);
  });
});
