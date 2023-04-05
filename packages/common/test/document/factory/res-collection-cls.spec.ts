/* eslint-disable @typescript-eslint/no-non-null-assertion */
import '@opra/sqb';
import {
  Collection,
  DocumentFactory,
  OpraSchema,
} from '@opra/common';
import { Country } from '../../_support/test-doc/index.js';

describe('DocumentFactory - Collection resource with decorated classes', function () {

  const baseArgs: DocumentFactory.InitArguments = {
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

    const doc = await DocumentFactory.createDocument({
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

      @Collection.CreateOperation()
      _create() {
        return this.x;
      }
    }

    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      resources: [CountriesResource]
    })
    expect(doc).toBeDefined();
    const t = doc.getCollection('countries');
    expect(t.controller).toBe(CountriesResource);
    expect(t.operations.create).toBeDefined();
    expect(t.operations.create?.handlerName).toStrictEqual('_create');
  })

  it('Should define "get" operation endpoint', async () => {
    @Collection(Country, {primaryKey: 'code'})
    class CountriesResource {
      protected x = 1;

      @Collection.GetOperation()
      _get() {
        return this.x;
      }
    }

    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      resources: [CountriesResource]
    })
    expect(doc).toBeDefined();
    const t = doc.getCollection('countries');
    expect(t.controller).toBe(CountriesResource);
    expect(t.operations.get).toBeDefined();
    expect(t.operations.get?.handlerName).toStrictEqual('_get');
  })

  it('Should define "update" operation endpoint', async () => {
    @Collection(Country, {primaryKey: 'code'})
    class CountriesResource {
      protected x = 1;

      @Collection.UpdateOperation()
      _update() {
        return this.x;
      }
    }

    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      resources: [CountriesResource]
    })
    expect(doc).toBeDefined();
    const t = doc.getCollection('countries');
    expect(t.controller).toBe(CountriesResource);
    expect(t.operations.update).toBeDefined();
    expect(t.operations.update?.handlerName).toStrictEqual('_update');
  })

  it('Should define "delete" operation endpoint', async () => {
    @Collection(Country, {primaryKey: 'code'})
    class CountriesResource {
      protected x = 1;

      @Collection.DeleteOperation()
      _delete() {
        return this.x;
      }
    }

    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      resources: [CountriesResource]
    })
    expect(doc).toBeDefined();
    const t = doc.getCollection('countries');
    expect(t.controller).toBe(CountriesResource);
    expect(t.operations.delete).toBeDefined();
    expect(t.operations.delete?.handlerName).toStrictEqual('_delete');
  })

  it('Should define "search" operation endpoint', async () => {
    @Collection(Country, {primaryKey: 'code'})
    class CountriesResource {
      protected x = 1;

      @Collection.SearchOperation()
      _search() {
        return this.x;
      }
    }

    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      resources: [CountriesResource]
    })
    expect(doc).toBeDefined();
    const t = doc.getCollection('countries');
    expect(t.controller).toBe(CountriesResource);
    expect(t.operations.search).toBeDefined();
    expect(t.operations.search?.handlerName).toStrictEqual('_search');
  })

  it('Should define "updateMany" operation endpoint', async () => {
    @Collection(Country, {primaryKey: 'code'})
    class CountriesResource {
      protected x = 1;

      @Collection.UpdateManyOperation()
      _updateMany() {
        return this.x;
      }
    }

    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      resources: [CountriesResource]
    })
    expect(doc).toBeDefined();
    const t = doc.getCollection('countries');
    expect(t.controller).toBe(CountriesResource);
    expect(t.operations.updateMany).toBeDefined();
    expect(t.operations.updateMany?.handlerName).toStrictEqual('_updateMany');
  })

  it('Should define "updateMany" operation endpoint', async () => {
    @Collection(Country, {primaryKey: 'code'})
    class CountriesResource {
      protected x = 1;

      @Collection.DeleteManyOperation()
      _deleteMany() {
        return this.x;
      }
    }

    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      resources: [CountriesResource]
    })
    expect(doc).toBeDefined();
    const t = doc.getCollection('countries');
    expect(t.controller).toBe(CountriesResource);
    expect(t.operations.deleteMany).toBeDefined();
    expect(t.operations.deleteMany?.handlerName).toStrictEqual('_deleteMany');
  })

});
