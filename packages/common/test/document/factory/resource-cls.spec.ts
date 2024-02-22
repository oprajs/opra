/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiAction,
  ApiDocumentFactory, ApiOperation,
  ApiResource,
  OpraSchema,
} from '@opra/common';
import { ApiOperationEntity } from '@opra/common/document/resource/operations/api-operation-entity';
import { Country } from '../../_support/test-api/index';

describe('ApiDocumentFactory - ApiResource() decorated class', function () {

  const baseArgs: ApiDocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    }
  };

  afterAll(() => global.gc && global.gc());

  it('Should import decorated class', async () => {
    @ApiResource({
      description: 'Country collection'
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
    const t = doc.getResource('countries');
    expect(t).toBeDefined();
    expect(t.ctor).toBe(CountriesResource);
  })

  it('Should import operation endpoint', async () => {
    @ApiResource()
    class CountriesResource {
      @ApiOperation({method: 'GET'})
      create() {
        return 1;
      }
    }

    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      root: {
        resources: [CountriesResource]
      }
    })
    expect(doc).toBeDefined();
    const t = doc.getResource('countries');
    expect(t.ctor).toBe(CountriesResource);
    const endpoint = t.getOperation('create');
    expect(endpoint).toBeDefined();
    expect(endpoint.method).toStrictEqual('GET');
  })

  it('Should import action endpoint', async () => {
    @ApiResource()
    class CountriesResource {

      @ApiAction({
        description: 'action description'
      })
      ping() {
        return 'pong';
      }
    }

    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      root: {
        resources: [CountriesResource]
      }
    })
    expect(doc).toBeDefined();
    const t = doc.getResource('countries');
    expect(t.ctor).toBe(CountriesResource);
    const endpoint = t.getAction('ping');
    expect(endpoint).toBeDefined();
    expect(endpoint.description).toStrictEqual('action description');
  })

  it('Should import ApiOperation.Entity.Create operation', async () => {
    @ApiResource()
    class CountriesResource {
      @ApiOperation.Entity.Create(Country)
      create() {
        return 1;
      }
    }

    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      root: {
        resources: [CountriesResource]
      }
    })
    expect(doc).toBeDefined();
    const t = doc.getResource('countries');
    expect(t.ctor).toBe(CountriesResource);
    const endpoint = t.getOperation('create');
    expect(endpoint).toBeDefined();
    expect(endpoint).toBeInstanceOf(ApiOperationEntity);
    expect(endpoint.method).toStrictEqual('POST');
  })

});
