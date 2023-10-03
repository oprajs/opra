/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiDocument, ApiDocumentFactory,
  Collection, ComplexType, EnumType,
  OpraSchema, Singleton,
} from '@opra/common';
import {
  AuthController,
  CountriesController,
  Country, Customer, CustomersController, GenderEnum, Profile
} from '../_support/test-api/index.js';

describe('ApiDocument', function () {
  const baseArgs: ApiDocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    },
    root: {
      resources: [CustomersController, CountriesController, AuthController]
    }
  };

  it('Should create ApiDocument instance', async () => {
    expect(OpraSchema.Container.Kind).toStrictEqual('Container');
  })

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

  it('Should getResource(name) return Resource instance', async () => {
    const doc = await ApiDocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(doc.getResource('Customers')).toBeInstanceOf(Collection);
    expect(doc.getResource('Customers').name).toStrictEqual('Customers');
  })

  it('Should getResource(name) throw if resource not a found', async () => {
    const doc = await ApiDocumentFactory.createDocument(baseArgs);
    expect(() => doc.getResource('unknownResource')).toThrow('not found');
  })

  it('Should getResource(name, silent) return undefined if resource not a found', async () => {
    const doc = await ApiDocumentFactory.createDocument(baseArgs);
    expect(doc.getResource('unknownResource', true)).not.toBeDefined();
  })

  it('Should getCollection(name) return Collection instance', async () => {
    const doc = await ApiDocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(doc.getCollection('Customers')).toBeInstanceOf(Collection);
  })

  it('Should getCollection(name) throw if resource is not a Collection', async () => {
    const doc = await ApiDocumentFactory.createDocument(baseArgs);
    expect(() => doc.getCollection('auth/MyProfile')).toThrow('is not a Collection');
  })

  it('Should getCollection(name, silent) return undefined if resource is not a Collection', async () => {
    const doc = await ApiDocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(() => doc.getCollection('auth/MyProfile')).toThrow('is not a Collection');
  })

  it('Should getSingleton(name) return Singleton instance', async () => {
    const doc = await ApiDocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(doc.getSingleton('auth/MyProfile')).toBeInstanceOf(Singleton);
  })

  it('Should getSingleton(name) throw if resource is not a Singleton', async () => {
    const doc = await ApiDocumentFactory.createDocument(baseArgs);
    expect(() => doc.getSingleton('Customers')).toThrow('is not a Singleton');
  })

  it('Should getSingleton(name, silent) return undefined if resource is not a Singleton', async () => {
    const doc = await ApiDocumentFactory.createDocument(baseArgs);
    expect(doc).toBeDefined();
    expect(() => doc.getSingleton('Customers')).toThrow('is not a Singleton');
  })

  it('Should exportSchema() return document schema', async () => {
    const doc = await ApiDocumentFactory.createDocument(baseArgs);
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
    expect(sch.root).toBeDefined();
    expect(sch.root?.resources).toBeDefined();
    expect(Object.keys(sch.root!.resources!).sort())
        .toEqual(['Countries', 'Customers', 'auth'].sort());
  })

});
