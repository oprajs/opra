import { Country } from 'customer-mongo/models';
import { ApiDocumentFactory, HttpApi, HttpController } from '@opra/common';

describe('HttpApiFactory - HttpController (Class)', function () {
  afterAll(() => global.gc && global.gc());

  it('Should import resource class', async () => {
    @HttpController({
      description: 'Country collection',
    })
    class CountriesResource {}

    const doc = await ApiDocumentFactory.createDocument({
      types: [Country],
      api: {
        protocol: 'http',
        name: 'TestService',
        controllers: [CountriesResource],
      },
    });
    expect(doc).toBeDefined();
    expect(doc.api).toBeDefined();
    const r = (doc.api as HttpApi).findController('countries');
    expect(r).toBeDefined();
    expect(r!.ctor).toBe(CountriesResource);
    expect(r!.description).toEqual('Country collection');
  });

  it('Should define custom name and path', async () => {
    @HttpController({
      name: 'MyCountries',
      path: '/My/Countries',
      description: 'Country collection',
    })
    class CountriesResource {}

    const doc = await ApiDocumentFactory.createDocument({
      types: [Country],
      api: {
        protocol: 'http',
        name: 'TestService',
        controllers: [CountriesResource],
      },
    });
    expect(doc).toBeDefined();
    expect(doc.api).toBeDefined();
    const r = (doc.api as HttpApi).findController('MyCountries');
    expect(r).toBeDefined();
    expect(r!.ctor).toBe(CountriesResource);
    expect(r!.name).toEqual('MyCountries');
    expect(r!.path).toEqual('/My/Countries');
  });

  it('Should import cookie parameters', async () => {
    @HttpController({
      description: 'Country collection',
    }).Cookie('access-token', { type: 'uuid', required: true })
    class CountriesResource {}

    const doc = await ApiDocumentFactory.createDocument({
      types: [Country],
      api: {
        protocol: 'http',
        name: 'TestService',
        controllers: [CountriesResource],
      },
    });
    expect(doc).toBeDefined();
    expect(doc.api).toBeDefined();
    const r = (doc.api as HttpApi).findController('countries');
    expect(r).toBeDefined();
    expect(r!.parameters.map(x => x.name)).toEqual(['access-token']);
    expect(r!.findParameter('access-token')?.location).toEqual('cookie');
    expect(r!.findParameter('access-token')?.required).toEqual(true);
  });

  it('Should import headers', async () => {
    @HttpController({
      description: 'Country collection',
    }).Header('access-token', { type: 'uuid', required: true })
    class CountriesResource {}

    const doc = await ApiDocumentFactory.createDocument({
      types: [Country],
      api: {
        protocol: 'http',
        name: 'TestService',
        controllers: [CountriesResource],
      },
    });
    expect(doc).toBeDefined();
    expect(doc.api).toBeDefined();
    const r = (doc.api as HttpApi).findController('countries');
    expect(r).toBeDefined();
    expect(r!.parameters.map(x => x.name)).toEqual(['access-token']);
    expect(r!.findParameter('access-token')?.location).toEqual('header');
    expect(r!.findParameter('access-token')?.required).toEqual(true);
  });

  it('Should import query parameters', async () => {
    @HttpController({
      description: 'Country collection',
    }).QueryParam('access-token', { type: 'uuid', required: true })
    class CountriesResource {}

    const doc = await ApiDocumentFactory.createDocument({
      types: [Country],
      api: {
        protocol: 'http',
        name: 'TestService',
        controllers: [CountriesResource],
      },
    });
    expect(doc).toBeDefined();
    expect(doc.api).toBeDefined();
    const r = (doc.api as HttpApi).findController('countries');
    expect(r).toBeDefined();
    expect(r!.parameters.map(x => x.name)).toEqual(['access-token']);
    expect(r!.findParameter('access-token')?.location).toEqual('query');
    expect(r!.findParameter('access-token')?.required).toEqual(true);
  });

  it('Should import path parameters', async () => {
    @HttpController({
      description: 'Country collection',
    }).PathParam('access-token', { type: 'uuid', required: true })
    class CountriesResource {}

    const doc = await ApiDocumentFactory.createDocument({
      types: [Country],
      api: {
        protocol: 'http',
        name: 'TestService',
        controllers: [CountriesResource],
      },
    });
    expect(doc).toBeDefined();
    expect(doc.api).toBeDefined();
    const r = (doc.api as HttpApi).findController('countries');
    expect(r).toBeDefined();
    expect(r!.parameters.map(x => x.name)).toEqual(['access-token']);
    expect(r!.findParameter('access-token')?.location).toEqual('path');
    expect(r!.findParameter('access-token')?.required).toEqual(true);
  });

  it('Should import sub controllers', async () => {
    @HttpController({
      description: 'Cities collection',
    })
    class CitiesResource {}

    @HttpController({
      description: 'Country collection',
      controllers: [CitiesResource],
    })
    class CountriesResource {}

    const doc = await ApiDocumentFactory.createDocument({
      types: [Country],
      api: {
        protocol: 'http',
        name: 'TestService',
        controllers: [CountriesResource],
      },
    });
    expect(doc).toBeDefined();
    expect(doc.api).toBeDefined();
    const r = (doc.api as HttpApi).findController('countries');
    expect(r).toBeDefined();
    expect(Array.from(r!.controllers.keys())).toEqual(['Cities']);
    expect(r!.controllers.get('cities')!.ctor).toEqual(CitiesResource);
  });
});
