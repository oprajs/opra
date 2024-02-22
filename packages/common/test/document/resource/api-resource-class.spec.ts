/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiDocument,
  ApiDocumentFactory,
  OpraSchema,
} from '@opra/common';
import { RootResource } from '../../_support/test-api/index.js';

describe('ApiResourceClass', function () {
  let api: ApiDocument;
  const baseArgs: ApiDocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
    },
    root: RootResource
  };

  beforeAll(async () => {
    api = await ApiDocumentFactory.createDocument(baseArgs);
  })

  afterAll(() => global.gc && global.gc());

  it('Should findResource(name) return undefined if resource not a found', async () => {
    const doc = await ApiDocumentFactory.createDocument(baseArgs);
    expect(doc.findResource('unknownResource')).not.toBeDefined();
  })

  it('Should isRoot return "true" for root resource "false" otherwise', async () => {
    expect(api.root.isRoot).toEqual(true);
    expect(api.getResource('customers').isRoot).toEqual(false);
  })

  it('Should getFullPath return resource path', async () => {
    expect(api.getResource('auth/MyProfile').getFullPath()).toEqual('/Auth/MyProfile');
  })

  it('Should getFullPath return document path', async () => {
    expect(api.getResource('auth/MyProfile').getFullPath(true)).toEqual('/resources/Auth/MyProfile');
  })


  it('Should findResource(name) return Resource instance', async () => {
    const res = api.findResource('auth/MyProfile');
    expect(res).toBeDefined();
    expect(res!.name).toStrictEqual('MyProfile');
  })

  it('Should getResource(name) return Resource instance', async () => {
    const res = api.getResource('auth/MyProfile');
    expect(res!.name).toStrictEqual('MyProfile');
  })

  it('Should toString() return string enumeration', async () => {
    const res = api.getResource('auth/MyProfile');
    expect(res!.toString()).toStrictEqual('[ApiResource MyProfile]');
  })

  it('Should exportSchema() return Resource schema', async () => {
    const res = api.getResource('Customers@');
    const sch = res.exportSchema();
    expect(sch).toEqual({
      kind: OpraSchema.Resource.Kind,
      description: "Customer resource",
      endpoints: {
        get: {
          kind: "Operation",
          composition: "Entity.FindOne",
          method: "GET",
          options: {
            type: 'Customer'
          }
        }
      },
      key: {
        name: "_id",
        type: "any"
      }
    });
  })

});
