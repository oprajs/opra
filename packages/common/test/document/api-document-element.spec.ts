/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiDocumentFactory, ComplexType, DataType,
  EnumType, SimpleType,
} from '@opra/common';
import { Country, GenderEnum, testApiDocumentDef } from '../_support/test-api/index.js';

describe('ApiDocumentElement', function () {

  afterAll(() => global.gc && global.gc());

  it('Should findDataType(name) return DataType instance', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(doc.findDataType('string')).toBeInstanceOf(DataType);
    expect(doc.findDataType('string')!.name).toStrictEqual('string');
  })

  it('Should findDataType(ctor: Class) return DataType instance', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(doc.findDataType(String)).toBeInstanceOf(DataType);
    expect(doc.findDataType(String)!.name).toStrictEqual('string');
  })

  it('Should findDataType(name) return `undefined` if not found', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(doc.findDataType('unknown')).not.toBeDefined();
  })

  it('Should getDataType(name) return DataType instance', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(doc.getDataType('string')).toBeInstanceOf(DataType);
    expect(doc.getDataType('string').name).toStrictEqual('string');
  })

  it('Should getDataType(ctor: Class) return DataType instance', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(doc.getDataType(String)).toBeInstanceOf(DataType);
    expect(doc.getDataType(String).name).toStrictEqual('string');
  })

  it('Should getDataType(unknown: string) throw if not found', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(() => doc.getDataType('notexists')).toThrow('Unknown data type');
  })

  it('Should getSimpleType(name) return DataType instance', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(doc.getSimpleType('string')).toBeInstanceOf(SimpleType);
    expect(doc.getSimpleType('string').name).toStrictEqual('string');
    expect(doc.getSimpleType('string').kind).toStrictEqual('SimpleType');
  })

  it('Should getSimpleType(ctor: Class) return DataType instance', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(doc.getSimpleType(String)).toBeInstanceOf(SimpleType);
    expect(doc.getSimpleType(String).name).toStrictEqual('string');
    expect(doc.getSimpleType(String).kind).toStrictEqual('SimpleType');
  })

  it('Should getSimpleType(name) throw if DataType is not SimpleType', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(() => doc.getSimpleType('object')).toThrow('is not');
  })

  it('Should getSimpleType(ctor: Class) throw if DataType is not SimpleType', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(() => doc.getSimpleType(Country)).toThrow('is not');
  })


  it('Should getComplexType(name) return DataType instance', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(doc.getComplexType('country')).toBeInstanceOf(ComplexType);
    expect(doc.getComplexType('country').name).toStrictEqual('Country');
    expect(doc.getComplexType('country').kind).toStrictEqual('ComplexType');
  })

  it('Should getComplexType(ctor: Class) return DataType instance', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(doc.getComplexType(Country)).toBeInstanceOf(ComplexType);
    expect(doc.getComplexType(Country).name).toStrictEqual('Country');
    expect(doc.getComplexType(Country).kind).toStrictEqual('ComplexType');
  })

  it('Should getComplexType(name) throw if DataType is not ComplexType', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(() => doc.getComplexType('string')).toThrow('is not');
  })

  it('Should getComplexType(ctor: Class) throw if DataType is not ComplexType', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(() => doc.getComplexType(String)).toThrow('is not');
  })

  it('Should getEnumType(name) return DataType instance', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(doc.getEnumType('GenderEnum')).toBeInstanceOf(EnumType);
    expect(doc.getEnumType('GenderEnum').name).toStrictEqual('GenderEnum');
    expect(doc.getEnumType('GenderEnum').kind).toStrictEqual('EnumType');
  })

  it('Should getEnumType(Obj) return DataType instance', async () => {
    const doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    expect(doc).toBeDefined();
    expect(doc.getEnumType(GenderEnum)).toBeInstanceOf(EnumType);
    expect(doc.getEnumType(GenderEnum).name).toStrictEqual('GenderEnum');
    expect(doc.getEnumType(GenderEnum).kind).toStrictEqual('EnumType');
  })

});
