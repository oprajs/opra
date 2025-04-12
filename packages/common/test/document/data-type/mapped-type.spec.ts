import 'reflect-metadata';
import {
  ApiDocument,
  ApiDocumentFactory,
  OmitType,
  OpraSchema,
  PartialType,
  PickType,
} from '@opra/common';
import { Country } from 'customer-mongo/models';
import { expect } from 'expect';
import { TestHttpApiDocument } from '../../_support/test-http-api/index.js';

describe('MappedType', () => {
  let doc: ApiDocument;

  before(async () => {
    const baseDoc = await TestHttpApiDocument.create();
    doc = await ApiDocumentFactory.createDocument({
      spec: OpraSchema.SpecVersion,
      references: {
        base: baseDoc,
      },
      types: [
        OmitType(Country, ['phonecode' as any], { name: 'OmitType1' }),
        PickType(Country, ['phonecode' as any], { name: 'PickType1' }),
        PartialType(Country, { name: 'PartialType1' }),
        PartialType(Country, ['phonecode' as any], { name: 'PartialType2' }),
      ],
    });
  });

  it('Should OmitType() create MappedType that omits given fields', async () => {
    const dt = doc.node.getMappedType('OmitType1');
    expect(dt).toBeDefined();
    expect(dt.name).toEqual('OmitType1');
    expect(dt.base?.name).toEqual('Country');
    expect(dt.omit).toEqual(['phoneCode']);
    expect(dt.findField('name')).toBeDefined();
    expect(dt.findField('phoneCode')).not.toBeDefined();
  });

  it('Should OmitType._generateSchema() return ValGen schema', async () => {
    const dt = doc.node.getMappedType('OmitType1');
    const x: any = (dt as any)._generateSchema('decode', {});
    expect(x).toBeDefined();
    expect(Object.keys(x)).toStrictEqual(['code', 'name']);
  });

  it('Should PickType() create MappedType that picks given fields', async () => {
    const dt = doc.node.getMappedType('PickType1');
    expect(dt).toBeDefined();
    expect(dt.name).toEqual('PickType1');
    expect(dt.base?.name).toEqual('Country');
    expect(dt.pick).toEqual(['phoneCode']);
    expect(dt.findField('name')).not.toBeDefined();
    expect(dt.findField('phoneCode')).toBeDefined();
  });

  it('Should PickType._generateSchema() return ValGen schema', async () => {
    const dt = doc.node.getMappedType('PickType1');
    const x: any = (dt as any)._generateSchema('decode', {});
    expect(x).toBeDefined();
    expect(Object.keys(x)).toStrictEqual(['phoneCode']);
  });

  it('Should PartialType() create MappedType that makes all fields partial', async () => {
    const dt = doc.node.getMappedType('PartialType1');
    expect(dt).toBeDefined();
    expect(dt.name).toEqual('PartialType1');
    expect(dt.base?.name).toEqual('Country');
    expect(dt.partial).toEqual(true);
    expect(dt.getField('name').required).toEqual(false);
    expect(dt.getField('phoneCode').required).toEqual(false);
  });

  it('Should PartialType() create MappedType that makes selected fields partial', async () => {
    const dt = doc.node.getMappedType('PartialType2');
    expect(dt).toBeDefined();
    expect(dt.name).toEqual('PartialType2');
    expect(dt.base?.name).toEqual('Country');
    expect(dt.partial).toEqual(['phoneCode']);
    expect(dt.getField('name').required).not.toEqual(false);
    expect(dt.getField('phoneCode').required).toEqual(false);
  });
});
