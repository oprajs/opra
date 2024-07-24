import { ApiDocument, OpraSchema } from '@opra/common';
import { TestApiDocument } from '../../_support/test-api/index.js';

describe('HttpResource', () => {
  let doc: ApiDocument;
  afterAll(() => global.gc && global.gc());

  beforeAll(async () => {
    doc = await TestApiDocument.create();
  });

  it('Should getResource(name) return undefined if resource not a found', async () => {
    expect(doc.api!.findController('unknownResource')).not.toBeDefined();
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
          required: true,
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
          statusCode: 200,
          description: expect.any(String),
          contentType: 'application/opra.response+json',
          contentEncoding: 'utf-8',
        },
        {
          statusCode: 422,
          contentType: 'application/opra.response+json',
          description: expect.any(String),
          contentEncoding: 'utf-8',
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
          name: 'projection',
          description: 'Determines fields projection',
          type: {
            base: 'fieldpath',
            kind: 'SimpleType',
            properties: {
              allowSigns: 'each',
              dataType: 'ns1:Customer',
            },
          },
          isArray: true,
          arraySeparator: ',',
        },
      ],
      responses: [
        {
          statusCode: 200,
          description: expect.any(String),
          contentType: 'application/opra.response+json',
          contentEncoding: 'utf-8',
          type: 'ns1:Customer',
          partial: 'deep',
        },
        {
          statusCode: 204,
          description: expect.any(String),
        },
        {
          statusCode: 422,
          contentType: 'application/opra.response+json',
          contentEncoding: 'utf-8',
          description: expect.any(String),
        },
      ],
    });
  });
});
