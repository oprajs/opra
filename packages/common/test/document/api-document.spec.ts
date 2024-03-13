/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ApiDocumentFactory, OpraSchema } from '@opra/common';
import { GenderEnum, testApiDocumentDef } from '../_support/test-api/index.js';

describe('ApiDocument', function () {

  afterAll(() => global.gc && global.gc());

  it('Should include built-in types by default', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(doc.references.size).toStrictEqual(1);
    const ref = doc.references.get('opra');
    expect(ref).toBeDefined();
    expect(ref?.getDataType('any')).toBeDefined();
    expect(ref?.getDataType('any').kind).toStrictEqual('SimpleType');
    expect(ref?.getDataType(Object)).toBeDefined();
    expect(ref?.getDataType(Object).name).toStrictEqual('any')

    expect(ref?.getDataType('bigint')).toBeDefined();
    expect(ref?.getDataType(BigInt)).toBeDefined();
    expect(ref?.getDataType(BigInt).name).toStrictEqual('bigint');

    expect(ref?.getDataType('boolean')).toBeDefined();
    expect(ref?.getDataType(Boolean)).toBeDefined();
    expect(ref?.getDataType(Boolean).name).toStrictEqual('boolean');

    expect(ref?.getDataType('integer')).toBeDefined();

    expect(ref?.getDataType('number')).toBeDefined();
    expect(ref?.getDataType(Number)).toBeDefined();
    expect(ref?.getDataType(Number).name).toStrictEqual('number');

    expect(ref?.getDataType('object')).toBeDefined();

    expect(ref?.getDataType('string')).toBeDefined();
    expect(ref?.getDataType(String)).toBeDefined();
    expect(ref?.getDataType(String).name).toStrictEqual('string')

    expect(ref?.getDataType('time')).toBeDefined();
    expect(ref?.getDataType('datetime')).toBeDefined();
  })

  it('Should getDataTypeNs() return namespace of DataType', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(doc.getDataTypeNs(GenderEnum)).not.toBeDefined();
    expect(doc.getDataTypeNs(String)).toStrictEqual('opra');
    expect(doc.getDataTypeNs('string')).toStrictEqual('opra');
  })

  it('Should toJSON() return document schema', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    const sch = doc.toJSON();
    expect(sch.spec).toStrictEqual(OpraSchema.SpecVersion);
    expect(sch.info).toStrictEqual(testApiDocumentDef.info);
    expect(sch.api).toBeDefined();
    expect(sch.api!.protocol).toEqual('http');
    expect(sch.api!.description).toEqual('test service');
    expect(sch.api!.url).toEqual('/test');
    expect(sch.api!.root).toBeDefined();
  })

});
