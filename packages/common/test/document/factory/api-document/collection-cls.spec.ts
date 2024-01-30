/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiDocumentFactory,
  Collection, EnumType,
  OpraSchema,
} from '@opra/common';
import { Country } from '../../../_support/test-api/index.js';

describe('ApiDocumentFactory - Collection resource with decorated classes', function () {

  const baseArgs: ApiDocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    }
  };

  afterAll(() => global.gc && global.gc());

  it('Should add Collection resource', async () => {
    @Collection(Country, {
      description: 'Country collection',
      primaryKey: 'code',
    })
    class CountriesResource {
    }

    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      root: {
        resources: [CountriesResource]
      }
    })
    expect(doc).toBeDefined();
    const t = doc.getCollection('countries');
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual(OpraSchema.Collection.Kind);
    expect(t.name).toStrictEqual('Countries');
    expect(t.description).toStrictEqual('Country collection');
    expect(t.primaryKey).toStrictEqual(['code']);
    expect(t.type.name).toEqual('Country');
    expect(t.ctor).toBe(CountriesResource);
    expect(t.getFullPath()).toStrictEqual('/Countries');
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
      root: {
        resources: [CountriesResource]
      }
    })
    expect(doc).toBeDefined();
    const t = doc.getCollection('countries');
    expect(t.ctor).toBe(CountriesResource);
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
      root: {
        resources: [CountriesResource]
      }
    })
    expect(doc).toBeDefined();
    const t = doc.getCollection('countries');
    expect(t.ctor).toBe(CountriesResource);
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
      root: {
        resources: [CountriesResource]
      }
    })
    expect(doc).toBeDefined();
    const t = doc.getCollection('countries');
    expect(t.ctor).toBe(CountriesResource);
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
      root: {
        resources: [CountriesResource]
      }
    })
    expect(doc).toBeDefined();
    const t = doc.getCollection('countries');
    expect(t.ctor).toBe(CountriesResource);
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
      root: {
        resources: [CountriesResource]
      }
    })
    expect(doc).toBeDefined();
    const t = doc.getCollection('countries');
    expect(t.ctor).toBe(CountriesResource);
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
      root: {
        resources: [CountriesResource]
      }
    })
    expect(doc).toBeDefined();
    const t = doc.getCollection('countries');
    expect(t.ctor).toBe(CountriesResource);
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
      root: {
        resources: [CountriesResource]
      }
    })
    expect(doc).toBeDefined();
    const t = doc.getCollection('countries');
    expect(t.ctor).toBe(CountriesResource);
    expect(t.getOperation('deleteMany')).toBeDefined();
  })

  it('Should define operation parameters', async () => {
    enum Prm4 {X = 'x', Y = 'y'};

    @Collection(Country, {primaryKey: 'code'})
    class CountriesResource {
      protected x = 1;

      @Collection.Create()
          .Parameter('prm1', String)
          .Parameter('prm2', 'number')
          .Parameter('prm3', {enum: ['x', 'y']})
          .Parameter('prm4', {enum: Prm4})
      create() {
        return this.x;
      }
    }

    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      root: {
        resources: [CountriesResource]
      }
    })
    expect(doc).toBeDefined();
    const t = doc.getCollection('countries');
    const op = t.operations.get('create');
    expect(op).toBeDefined();
    const prm1 = op?.getParameter('prm1');
    const prm2 = op?.getParameter('prm2');
    const prm3 = op?.getParameter('prm3');
    const prm4 = op?.getParameter('prm4');
    expect(prm1).toBeDefined();
    expect(prm2).toBeDefined();
    expect(prm3).toBeDefined();
    expect(prm4).toBeDefined();
    expect(prm1?.type.name).toStrictEqual('string');
    expect(prm2?.type.name).toStrictEqual('number');
    expect(prm3?.type.kind).toStrictEqual('EnumType');
    expect((prm3?.type as EnumType).values).toStrictEqual({x: {}, y: {}});
    expect(prm4?.type.kind).toStrictEqual('EnumType');
    expect((prm4?.type as EnumType).values).toStrictEqual({x: {key: 'X'}, y: {key: 'Y'}});
  })

});
