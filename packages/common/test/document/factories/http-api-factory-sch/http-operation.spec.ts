import assert from 'assert';
import { ApiDocumentFactory, OpraSchema } from '@opra/common';
import { Country } from '../../../_support/test-api/index.js';

describe('HttpApiFactory - HttpOperation (Schema)', function () {
  afterAll(() => global.gc && global.gc());

  it('Should import resource schema', async () => {
    const countries: OpraSchema.HttpController = {
      kind: 'HttpController',
      operations: {
        findOne: {
          kind: 'HttpOperation',
          method: 'GET',
          description: 'Returns single country',
        },
      },
    };
    const doc = await ApiDocumentFactory.createDocument({
      types: [Country],
      api: {
        protocol: 'http',
        name: 'TestService',
        root: {
          controllers: { countries },
        },
      },
    });
    expect(doc).toBeDefined();
    expect(doc.api).toBeDefined();
    const r = doc.api!.root.findController('countries');
    expect(r).toBeDefined();
    assert(r);
    expect(r).toBeDefined();
    const opr = r!.operations.get('findOne');
    expect(opr).toBeDefined();
    expect(opr?.method).toEqual('GET');
    expect(opr?.description).toEqual('Returns single country');
  });

  it('Should import parameters', async () => {
    const countries: OpraSchema.HttpController = {
      kind: 'HttpController',
      operations: {
        findOne: {
          kind: 'HttpOperation',
          method: 'GET',
          parameters: [
            {
              location: 'cookie',
              name: 'access-token',
              type: 'uuid',
              required: true,
            },
          ],
        },
      },
    };
    const doc = await ApiDocumentFactory.createDocument({
      types: [Country],
      api: {
        protocol: 'http',
        name: 'TestService',
        root: {
          controllers: { countries },
        },
      },
    });
    expect(doc).toBeDefined();
    expect(doc.api).toBeDefined();
    const r = doc.api!.root.findController('countries');
    expect(r).toBeDefined();
    assert(r);
    const opr = r!.operations.get('findOne');
    expect(opr).toBeDefined();
    expect(opr?.findParameter('access-token')).toBeDefined();
  });
});
