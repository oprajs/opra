/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Collection,
  ApiDocumentFactory,
  OpraSchema,
} from '@opra/common';
import { Country } from '../../_support/test-api/index.js';

describe('ApiDocumentFactory - Collection resource with decorated classes', function () {

  const baseArgs: ApiDocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    }
  };

  it('Should add Collection resource', async () => {
    @Collection(Country, {
      description: 'Country collection',
      primaryKey: 'code',
    })
    class CountriesResource {
    }

    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      resources: [CountriesResource]
    })
    expect(doc).toBeDefined();
    const t = doc.getCollection('countries');
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual(OpraSchema.Collection.Kind);
    expect(t.name).toStrictEqual('Countries');
    expect(t.description).toStrictEqual('Country collection');
    expect(t.primaryKey).toStrictEqual(['code']);
    expect(t.type.name).toEqual('Country');
    expect(t.controller).toBe(CountriesResource);
  })

  it('Should define "create" operation endpoint', async () => {
    @Collection(Country, {primaryKey: 'code'})
    class CountriesResource {
      protected x = 1;

      @Collection.Create()
      create() {
        return this.x;
      }
    }

    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      resources: [CountriesResource]
    })
    expect(doc).toBeDefined();
    const t = doc.getCollection('countries');
    expect(t.controller).toBe(CountriesResource);
    expect(t.getOperation('create')).toBeDefined();
  })

  it('Should define "get" operation endpoint', async () => {
    @Collection(Country, {primaryKey: 'code'})
    class CountriesResource {
      protected x = 1;

      @Collection.Get()
      get() {
        return this.x;
      }
    }

    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      resources: [CountriesResource]
    })
    expect(doc).toBeDefined();
    const t = doc.getCollection('countries');
    expect(t.controller).toBe(CountriesResource);
    expect(t.getOperation('get')).toBeDefined();
  })

  it('Should define "update" operation endpoint', async () => {
    @Collection(Country, {primaryKey: 'code'})
    class CountriesResource {
      protected x = 1;

      @Collection.Update()
      update() {
        return this.x;
      }
    }

    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      resources: [CountriesResource]
    })
    expect(doc).toBeDefined();
    const t = doc.getCollection('countries');
    expect(t.controller).toBe(CountriesResource);
    expect(t.getOperation('update')).toBeDefined();
  })

  it('Should define "deleteOne" operation endpoint', async () => {
    @Collection(Country, {primaryKey: 'code'})
    class CountriesResource {
      protected x = 1;

      @Collection.Delete()
      delete() {
        return this.x;
      }
    }

    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      resources: [CountriesResource]
    })
    expect(doc).toBeDefined();
    const t = doc.getCollection('countries');
    expect(t.controller).toBe(CountriesResource);
    expect(t.getOperation('delete')).toBeDefined();
  })

  it('Should define "search" operation endpoint', async () => {
    @Collection(Country, {primaryKey: 'code'})
    class CountriesResource {
      protected x = 1;

      @Collection.FindMany()
      findMany() {
        return this.x;
      }
    }

    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      resources: [CountriesResource]
    })
    expect(doc).toBeDefined();
    const t = doc.getCollection('countries');
    expect(t.controller).toBe(CountriesResource);
    expect(t.getOperation('findMany')).toBeDefined();
  })

  it('Should define "updateMany" operation endpoint', async () => {
    @Collection(Country, {primaryKey: 'code'})
    class CountriesResource {
      protected x = 1;

      @Collection.UpdateMany()
      updateMany() {
        return this.x;
      }
    }

    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      resources: [CountriesResource]
    })
    expect(doc).toBeDefined();
    const t = doc.getCollection('countries');
    expect(t.controller).toBe(CountriesResource);
    expect(t.getOperation('updateMany')).toBeDefined();
  })

  it('Should define "updateMany" operation endpoint', async () => {
    @Collection(Country, {primaryKey: 'code'})
    class CountriesResource {
      protected x = 1;

      @Collection.DeleteMany()
      deleteMany() {
        return this.x;
      }
    }

    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      resources: [CountriesResource]
    })
    expect(doc).toBeDefined();
    const t = doc.getCollection('countries');
    expect(t.controller).toBe(CountriesResource);
    expect(t.getOperation('deleteMany')).toBeDefined();
  })

});
