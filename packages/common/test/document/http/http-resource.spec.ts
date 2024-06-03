/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ApiDocument, ApiDocumentFactory, OpraSchema } from '@opra/common';
import { testApiDocumentDef } from '../../_support/test-api/index.js';

describe('HttpResource', function () {
  let doc: ApiDocument;

  beforeAll(async () => {
    doc = await ApiDocumentFactory.createDocument(testApiDocumentDef);
  });

  afterAll(() => global.gc && global.gc());

  it('Should getResource(name) return undefined if resource not a found', async () => {
    expect(doc.api!.findController('unknownResource')).not.toBeDefined();
  });

  it('Should getFullPath return resource path', async () => {
    const res = doc.api!.findController('auth/MyProfile');
    expect(res).toBeDefined();
    expect(res!.getDocumentPath()).toEqual('/Auth/MyProfile');
  });

  it('Should getResource(name) return Resource instance', async () => {
    const res = doc.api!.findController('auth/MyProfile');
    expect(res).toBeDefined();
    expect(res!.name).toStrictEqual('MyProfile');
  });

  it('Should toString() return string enumeration', async () => {
    const res = doc.api!.findController('auth/MyProfile');
    expect(res!.toString()).toStrictEqual('[HttpController MyProfile]');
  });

  it('Should toJSON() return Resource schema', async () => {
    const res = doc.api!.findController('Customer')!;
    const sch = res.toJSON();
    expect(sch).toEqual({
      kind: OpraSchema.HttpController.Kind,
      description: 'Customer resource',
      path: 'Customers@:customerId',
      parameters: [
        {
          location: 'path',
          name: 'customerId',
          type: 'uuid',
        },
      ],
      operations: expect.any(Object),
    });
    expect(sch.operations).toBeDefined();
    expect(sch.operations?.delete).toEqual({
      kind: 'HttpOperation',
      method: 'DELETE',
      composition: 'Entity.Delete',
      responses: [
        {
          description: expect.any(String),
          contentType: 'application/opra.response+json',
          statusCode: 200,
        },
        {
          contentType: 'application/opra.response+json',
          description: expect.any(String),
          statusCode: 422,
        },
      ],
    });
    expect(sch.operations?.get).toEqual({
      kind: 'HttpOperation',
      composition: 'Entity.Get',
      method: 'GET',
      parameters: [
        {
          location: 'query',
          name: 'fields',
          description: 'Determines fields to be exposed',
          type: {
            base: 'fieldPath',
            kind: 'SimpleType',
            properties: {
              allowSigns: 'each',
              dataType: 'Customer',
            },
          },
          isArray: true,
          arraySeparator: ',',
        },
      ],
      responses: [
        {
          description: expect.any(String),
          contentType: 'application/opra.response+json',
          contentEncoding: 'utf-8',
          statusCode: 200,
          type: 'Customer',
        },
        {
          description: expect.any(String),
          statusCode: 204,
        },
        {
          contentType: 'application/opra.response+json',
          description: expect.any(String),
          statusCode: 422,
        },
      ],
    });
  });
});
