/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiDocument,
  ApiDocumentFactory, HttpService,
  OpraSchema,
} from '@opra/common';
import { testApiDocumentDef } from '../../_support/test-api/index.js';

describe('HttpResource', function () {
  let api: ApiDocument;
  let service: HttpService;

  beforeAll(async () => {
    api = await ApiDocumentFactory.createDocument(testApiDocumentDef);
    service = api.getService('TestService') as HttpService;
  })

  afterAll(() => global.gc && global.gc());

  it('Should getResource(name) return undefined if resource not a found', async () => {
    expect(service.root.getResource('unknownResource')).not.toBeDefined();
  })

  it('Should isRoot return "true" for root resource "false" otherwise', async () => {
    expect(service.root.isRoot).toEqual(true);
    expect(service.root.getResource('customers')).toBeDefined();
    expect(service.root.getResource('customers')!.isRoot).toEqual(false);
  })

  it('Should getFullPath return resource path', async () => {
    expect(service.root.getResource('auth/MyProfile')!.getFullPath()).toEqual('/Auth/MyProfile');
  })

  it('Should getFullPath return document path', async () => {
    expect(service.root.getResource('auth/MyProfile')!.getFullPath(true)).toEqual('/resources/Auth/MyProfile');
  })

  it('Should getResource(name) return Resource instance', async () => {
    const res = service.root.getResource('auth/MyProfile');
    expect(res).toBeDefined();
    expect(res!.name).toStrictEqual('MyProfile');
  })

  it('Should toString() return string enumeration', async () => {
    const res = service.root.getResource('auth/MyProfile');
    expect(res!.toString()).toStrictEqual('[HttpResource MyProfile]');
  })

  it('Should toJSON() return Resource schema', async () => {
    const res = service.root.getResource('Customers@')!;
    const sch = res.toJSON();
    expect(sch).toEqual({
      kind: OpraSchema.Http.Resource.Kind,
      description: "Customer resource",
      endpoints: {
        get: {
          kind: "Operation",
          composition: "Entity.Get",
          method: "GET",
          responses: [
            {
              contentType: "application/opra.instance+json",
              statusCode: "200",
              partial: true,
              type: "Customer"
            }
          ]
        }
      },
      keyParameter: {
        name: "_id",
        type: "any"
      }
    });
  })

});
