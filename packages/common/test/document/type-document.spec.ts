/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ComplexType, DataType, EnumType, OpraSchema, SimpleType,
  TypeDocument, TypeDocumentFactory,
} from '@opra/common';
import {
  Country, Customer, GenderEnum, Profile
} from '../_support/test-api/index.js';

describe('TypeDocument', function () {
  const baseArgs: TypeDocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    },
    types: [Customer, Country, Profile]
  };

  afterAll(() => global.gc && global.gc());

  it('Should create TypeDocument instance', async () => {
    const doc = await TypeDocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(doc).toBeInstanceOf(TypeDocument);
    expect(doc.info).toBeDefined();
    expect(doc.info).toStrictEqual(baseArgs.info);
  })

  it('Should getDataType(name) return DataType instance', async () => {
    const doc = await TypeDocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(doc.getDataType('string')).toBeInstanceOf(DataType);
    expect(doc.getDataType('string').name).toStrictEqual('string');
  })

  it('Should getDataType(ctor: Class) return DataType instance', async () => {
    const doc = await TypeDocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(doc.getDataType(String)).toBeInstanceOf(DataType);
    expect(doc.getDataType(String).name).toStrictEqual('string');
  })

  it('Should getDataType(unknown: string) throw if not found', async () => {
    const doc = await TypeDocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(() => doc.getDataType('notexists')).toThrow('does not exists');
  })

  it('Should getSimpleType(name) return DataType instance', async () => {
    const doc = await TypeDocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(doc.getSimpleType('string')).toBeInstanceOf(SimpleType);
    expect(doc.getSimpleType('string').name).toStrictEqual('string');
    expect(doc.getSimpleType('string').kind).toStrictEqual('SimpleType');
  })

  it('Should getSimpleType(ctor: Class) return DataType instance', async () => {
    const doc = await TypeDocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(doc.getSimpleType(String)).toBeInstanceOf(SimpleType);
    expect(doc.getSimpleType(String).name).toStrictEqual('string');
    expect(doc.getSimpleType(String).kind).toStrictEqual('SimpleType');
  })

  it('Should getSimpleType(name) throw if DataType is not SimpleType', async () => {
    const doc = await TypeDocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(() => doc.getSimpleType('object')).toThrow('is not');
  })

  it('Should getSimpleType(ctor: Class) throw if DataType is not SimpleType', async () => {
    const doc = await TypeDocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(() => doc.getSimpleType(Country)).toThrow('is not');
  })

  it('Should getComplexType(name) return DataType instance', async () => {
    const doc = await TypeDocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(doc.getComplexType('country')).toBeInstanceOf(ComplexType);
    expect(doc.getComplexType('country').name).toStrictEqual('Country');
    expect(doc.getComplexType('country').kind).toStrictEqual('ComplexType');
  })

  it('Should getComplexType(ctor: Class) return DataType instance', async () => {
    const doc = await TypeDocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(doc.getComplexType(Country)).toBeInstanceOf(ComplexType);
    expect(doc.getComplexType(Country).name).toStrictEqual('Country');
    expect(doc.getComplexType(Country).kind).toStrictEqual('ComplexType');
  })

  it('Should getComplexType(name) throw if DataType is not ComplexType', async () => {
    const doc = await TypeDocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(() => doc.getComplexType('string')).toThrow('is not');
  })

  it('Should getComplexType(ctor: Class) throw if DataType is not ComplexType', async () => {
    const doc = await TypeDocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(() => doc.getComplexType(String)).toThrow('is not');
  })

  it('Should getEnumType(name) return DataType instance', async () => {
    const doc = await TypeDocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(doc.getEnumType('GenderEnum')).toBeInstanceOf(EnumType);
    expect(doc.getEnumType('GenderEnum').name).toStrictEqual('GenderEnum');
    expect(doc.getEnumType('GenderEnum').kind).toStrictEqual('EnumType');
  })

  it('Should getEnumType(Obj) return DataType instance', async () => {
    const doc = await TypeDocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(doc.getEnumType(GenderEnum)).toBeInstanceOf(EnumType);
    expect(doc.getEnumType(GenderEnum).name).toStrictEqual('GenderEnum');
    expect(doc.getEnumType(GenderEnum).kind).toStrictEqual('EnumType');
  })

  it('Should include built-in types by default', async () => {
    const doc = await TypeDocumentFactory.createDocument(baseArgs);
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
    const doc = await TypeDocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(doc.getDataTypeNs(GenderEnum)).not.toBeDefined();
    expect(doc.getDataTypeNs(String)).toStrictEqual('opra');
    expect(doc.getDataTypeNs('string')).toStrictEqual('opra');
  })

  it('Should exportSchema() return document schema', async () => {
    const doc = await TypeDocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    const sch = doc.exportSchema();
    expect(sch.version).toStrictEqual(OpraSchema.SpecVersion);
    expect(sch.info).toStrictEqual(baseArgs.info);
    expect(sch.types).toBeDefined();
    expect(Object.keys(sch.types!).sort())
        .toEqual(['Address', 'Country', 'Customer',
          'GenderEnum', 'Note', 'Person', 'Profile', 'Record'].sort());
    expect(sch.types?.Record).toBeDefined();
    expect(sch.types?.Record).toEqual(
        expect.objectContaining({
          kind: 'ComplexType',
          description: 'Base Record schema',
          abstract: true
        })
    );
  })

});
