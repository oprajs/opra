/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  DocumentFactory,
  OpraSchema,
  Singleton,
} from '@opra/common';
import { Country } from '../../_support/test-api/index.js';

describe('DocumentFactory - Singleton resource with decorated classes', function () {

  const baseArgs: DocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    }
  };

  it('Should add Singleton resource', async () => {
    @Singleton(Country, {
      description: 'Country singleton',
    })
    class MyCountryResource {

    }

    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      sources: [MyCountryResource]
    })
    expect(doc).toBeDefined();
    const t = doc.getSingleton('MyCountry');
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual(OpraSchema.Singleton.Kind);
    expect(t.name).toStrictEqual('MyCountry');
    expect(t.description).toStrictEqual('Country singleton');
    expect(t.type.name).toEqual('Country');
    expect(t.controller).toBe(MyCountryResource);
  })


  it('Should define "create" operation endpoint', async () => {
    @Singleton(Country)
    class MyCountryResource {
      protected x = 1;

      @Singleton.Create()
      create() {
        return this.x;
      }
    }

    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      sources: [MyCountryResource]
    })
    expect(doc).toBeDefined();
    const t = doc.getSingleton('MyCountry');
    expect(t.controller).toBe(MyCountryResource);
    expect(t.endpoints.create).toBeDefined();
  })

  it('Should define "get" operation endpoint', async () => {
    @Singleton(Country)
    class MyCountryResource {
      protected x = 1;

      @Singleton.Get()
      get() {
        return this.x;
      }
    }

    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      sources: [MyCountryResource]
    })
    expect(doc).toBeDefined();
    const t = doc.getSingleton('MyCountry');
    expect(t.controller).toBe(MyCountryResource);
    expect(t.endpoints.get).toBeDefined();
  })

  it('Should define "update" operation endpoint', async () => {
    @Singleton(Country)
    class MyCountryResource {
      protected x = 1;

      @Singleton.Update()
      update() {
        return this.x;
      }
    }

    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      sources: [MyCountryResource]
    })
    expect(doc).toBeDefined();
    const t = doc.getSingleton('MyCountry');
    expect(t.controller).toBe(MyCountryResource);
    expect(t.endpoints.update).toBeDefined();
  })

  it('Should define "deleteOne" operation endpoint', async () => {
    @Singleton(Country)
    class MyCountryResource {
      protected x = 1;

      @Singleton.Delete()
      delete() {
        return this.x;
      }
    }

    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      sources: [MyCountryResource]
    })
    expect(doc).toBeDefined();
    const t = doc.getSingleton('MyCountry');
    expect(t.controller).toBe(MyCountryResource);
    expect(t.endpoints.delete).toBeDefined();
  })

});
