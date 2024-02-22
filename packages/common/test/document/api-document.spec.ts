/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiDocument, ApiDocumentFactory,
  ComplexType, EnumType,
  OpraSchema, ResourceNotAvailableError,
} from '@opra/common';
import {
  Country,
  Customer,
  GenderEnum,
  Profile,
  RootResource
} from '../_support/test-api/index.js';

describe('ApiDocument', function () {

  const baseArgs: ApiDocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    },
    root: RootResource
  };

  afterAll(() => global.gc && global.gc());

  it('Should create ApiDocument instance', async () => {
    const doc = await ApiDocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(doc).toBeInstanceOf(ApiDocument);
    expect(doc.info).toBeDefined();
    expect(doc.info).toStrictEqual(baseArgs.info);
  })

  it('Should import data types used by resources', async () => {
    const doc = await ApiDocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(doc.getComplexType(Country)).toBeInstanceOf(ComplexType);
    expect(doc.getComplexType(Customer)).toBeInstanceOf(ComplexType);
    expect(doc.getComplexType(Profile)).toBeInstanceOf(ComplexType);
    expect(doc.getEnumType(GenderEnum)).toBeInstanceOf(EnumType);
  })

  it('Should findResource(name) return Resource instance', async () => {
    const doc = await ApiDocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(doc.findResource('Customers')!.name).toStrictEqual('Customers');
    expect(doc.findResource('Customers@')!.name).toStrictEqual('Customers@');
  })

  it('Should getResource(name) return Resource instance', async () => {
    const doc = await ApiDocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(doc.getResource('Customers').name).toStrictEqual('Customers');
    expect(doc.getResource('Customers@').name).toStrictEqual('Customers@');
  })

  it('Should getResource(name) throw if resource not a found', async () => {
    const doc = await ApiDocumentFactory.createDocument(baseArgs);
    expect(() => doc.getResource('unknownResource')).toThrow(ResourceNotAvailableError);
  })

  it('Should findResource(name) return undefined if resource not a found', async () => {
    const doc = await ApiDocumentFactory.createDocument(baseArgs);
    expect(doc.findResource('unknownResource')).not.toBeDefined();
  })

  it('Should exportSchema() return document schema', async () => {
    const doc = await ApiDocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    const sch = doc.exportSchema();
    expect(sch.version).toStrictEqual(OpraSchema.SpecVersion);
    expect(sch.info).toStrictEqual(baseArgs.info);
    expect(sch.root).toBeDefined();
    expect(sch.root?.resources).toBeDefined();
    expect(Object.keys(sch.root!.resources!).sort())
        .toEqual(['Auth', 'Countries', 'Countries@', 'Customers', 'Customers@'].sort());
    expect(Object.keys(sch.root!.resources!.Auth!.resources!).sort())
        .toEqual(['MyProfile'].sort());
  })

});
