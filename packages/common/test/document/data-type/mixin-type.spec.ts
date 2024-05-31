import 'reflect-metadata';
import { ApiDocument, ApiDocumentFactory, MixinType, OpraSchema } from '@opra/common';
import { Country, Note, Record } from '../../_support/test-api/index.js';

describe('MixinType', function () {
  let api: ApiDocument;
  const baseArgs: ApiDocumentFactory.InitArguments = {
    spec: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
    },
    types: [
      Record,
      Country,
      Note,
      MixinType(Record, Country, { name: 'MixinType1' }),
      MixinType(Record, Country, Note, { name: 'MixinType2' }),
    ],
  };

  beforeAll(async () => {
    api = await ApiDocumentFactory.createDocument(baseArgs);
  });

  it('Should create MixinType with two types', async function () {
    const dt = api.node.getMixinType('MixinType1');
    expect(dt).toBeDefined();
    expect(dt.name).toEqual('MixinType1');
    expect(dt.types.length).toEqual(2);
    expect(dt.types[0].name).toEqual('Record');
    expect(dt.types[1].name).toEqual('Country');
    expect(dt.findField('_id')).toBeDefined();
    expect(dt.findField('phoneCode')).toBeDefined();
  });

  it('Should create MixinType with three types', async function () {
    const dt = api.node.getMixinType('MixinType2');
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
    const dt = api.node.getMixinType('MixinType2');
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
