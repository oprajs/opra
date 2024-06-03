import assert from 'assert';
import { ApiDocumentFactory, OpraSchema } from '@opra/common';
import { Country } from '../../../_support/test-api/index.js';

describe('HttpApiFactory - HttpResource (Schema)', function () {
  afterAll(() => global.gc && global.gc());

  it('Should import resource schema', async () => {
    const countries: OpraSchema.HttpController = {
      kind: 'HttpController',
      description: 'Country collection',
      path: 'custompath',
    };
    const doc = await ApiDocumentFactory.createDocument({
      types: [Country],
      api: {
        protocol: 'http',
        name: 'TestService',
        controllers: { countries },
      },
    });
    expect(doc).toBeDefined();
    expect(doc.api).toBeDefined();
    const r = doc.api!.findController('countries');
    expect(r).toBeDefined();
    assert(r);
    expect(r).toBeDefined();
    expect(r!.description).toEqual('Country collection');
    expect(r!.path).toEqual('custompath');
  });

  it('Should import parameters', async () => {
    const countries: OpraSchema.HttpController = {
      kind: 'HttpController',
      parameters: [
        {
          location: 'cookie',
          name: 'access-token',
          type: 'uuid',
          required: true,
        },
      ],
    };
    const doc = await ApiDocumentFactory.createDocument({
      types: [Country],
      api: {
        protocol: 'http',
        name: 'TestService',
        controllers: { countries },
      },
    });
    expect(doc).toBeDefined();
    expect(doc.api).toBeDefined();
    const r = doc.api!.findController('countries');
    expect(r).toBeDefined();
    assert(r);
    expect(r).toBeDefined();
    expect(r!.parameters.map(x => x.name)).toEqual(['access-token']);
    expect(r!.findParameter('access-token')?.location).toEqual('cookie');
    expect(r!.findParameter('access-token')?.required).toEqual(true);
  });

  it('Should import sub controllers', async () => {
    const cities: OpraSchema.HttpController = {
      kind: 'HttpController',
    };
    const countries: OpraSchema.HttpController = {
      kind: 'HttpController',
      controllers: { cities },
    };
    const doc = await ApiDocumentFactory.createDocument({
      types: [Country],
      api: {
        protocol: 'http',
        name: 'TestService',
        controllers: { countries },
      },
    });
    expect(doc).toBeDefined();
    expect(doc.api).toBeDefined();
    const r = doc.api!.findController('countries');
    expect(r).toBeDefined();
    assert(r);
    expect(r).toBeDefined();
    expect(Array.from(r!.controllers.keys())).toEqual(['cities']);
  });
});
