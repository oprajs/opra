/* eslint-disable @typescript-eslint/no-non-null-assertion */
import '@opra/sqb';
import {
  DocumentFactory,
  OpraSchema,
  Singleton,
} from '@opra/common';
import { Country } from '../../_support/test-doc/index.js';

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
      resources: [MyCountryResource]
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

      @Singleton.CreateOperation()
      _create() {
        return this.x;
      }
    }

    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      resources: [MyCountryResource]
    })
    expect(doc).toBeDefined();
    const t = doc.getSingleton('MyCountry');
    expect(t.controller).toBe(MyCountryResource);
    expect(t.operations.create).toBeDefined();
    expect(t.operations.create?.handlerName).toStrictEqual('_create');
  })

  it('Should define "get" operation endpoint', async () => {
    @Singleton(Country)
    class MyCountryResource {
      protected x = 1;

      @Singleton.GetOperation()
      _read() {
        return this.x;
      }
    }

    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      resources: [MyCountryResource]
    })
    expect(doc).toBeDefined();
    const t = doc.getSingleton('MyCountry');
    expect(t.controller).toBe(MyCountryResource);
    expect(t.operations.get).toBeDefined();
    expect(t.operations.get?.handlerName).toStrictEqual('_read');
  })

  it('Should define "update" operation endpoint', async () => {
    @Singleton(Country)
    class MyCountryResource {
      protected x = 1;

      @Singleton.UpdateOperation()
      _update() {
        return this.x;
      }
    }

    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      resources: [MyCountryResource]
    })
    expect(doc).toBeDefined();
    const t = doc.getSingleton('MyCountry');
    expect(t.controller).toBe(MyCountryResource);
    expect(t.operations.update).toBeDefined();
    expect(t.operations.update?.handlerName).toStrictEqual('_update');
  })

  it('Should define "delete" operation endpoint', async () => {
    @Singleton(Country)
    class MyCountryResource {
      protected x = 1;

      @Singleton.DeleteOperation()
      _delete() {
        return this.x;
      }
    }

    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      resources: [MyCountryResource]
    })
    expect(doc).toBeDefined();
    const t = doc.getSingleton('MyCountry');
    expect(t.controller).toBe(MyCountryResource);
    expect(t.operations.delete).toBeDefined();
    expect(t.operations.delete?.handlerName).toStrictEqual('_delete');
  })

});
