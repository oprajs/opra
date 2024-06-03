/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ApiDocument, ApiDocumentFactory, OpraDocumentError, OpraSchema } from '@opra/common';

describe('ApiDocumentFactory', function () {
  afterAll(() => global.gc && global.gc());

  it('Should create ApiDocument', async () => {
    const doc = await ApiDocumentFactory.createDocument({
      spec: OpraSchema.SpecVersion,
      info: {
        title: 'TestDocument',
        version: 'v1',
        description: 'Document description',
      },
      url: 'http://tempuri.org',
    });
    expect(doc).toBeDefined();
    expect(doc).toBeInstanceOf(ApiDocument);
    expect(doc.info).toBeDefined();
    expect(doc.info.title).toStrictEqual('TestDocument');
    expect(doc.info.version).toStrictEqual('v1');
    expect(doc.info.description).toStrictEqual('Document description');
    expect(doc.url).toStrictEqual('http://tempuri.org');
  });

  it('Should add built-in opra document into references', async () => {
    const doc = await ApiDocumentFactory.createDocument({
      spec: OpraSchema.SpecVersion,
      info: {
        title: 'TestDocument',
        version: 'v1',
      },
    });
    const ref = doc.references.get('opra');
    expect(ref).toBeDefined();
    expect(ref?.node.getDataType('any')).toBeDefined();
    expect(ref?.node.getDataType('bigint')).toBeDefined();
    expect(ref?.node.getDataType('boolean')).toBeDefined();
    expect(ref?.node.getDataType('integer')).toBeDefined();
    expect(ref?.node.getDataType('null')).toBeDefined();
    expect(ref?.node.getDataType('number')).toBeDefined();
    expect(ref?.node.getDataType('object')).toBeDefined();
    expect(ref?.node.getDataType('string')).toBeDefined();
    expect(ref?.node.getDataType('approxdate')).toBeDefined();
    expect(ref?.node.getDataType('approxdatetime')).toBeDefined();
    expect(ref?.node.getDataType('base64')).toBeDefined();
    expect(ref?.node.getDataType('date')).toBeDefined();
    expect(ref?.node.getDataType('datetime')).toBeDefined();
    expect(ref?.node.getDataType('email')).toBeDefined();
    expect(ref?.node.getDataType('fieldpath')).toBeDefined();
    expect(ref?.node.getDataType('objectid')).toBeDefined();
    expect(ref?.node.getDataType('time')).toBeDefined();
    expect(ref?.node.getDataType('url')).toBeDefined();
    expect(ref?.node.getDataType('uuid')).toBeDefined();
  });

  it('Should import references', async () => {
    const doc = await ApiDocumentFactory.createDocument({
      spec: OpraSchema.SpecVersion,
      references: {
        test1: {
          info: {
            title: 'Test1Document',
          },
        },
      },
    });
    expect(doc).toBeDefined();
    expect(doc).toBeInstanceOf(ApiDocument);
    expect(doc.references.size).toEqual(2);
    const ref = doc.references.get('test1');
    expect(ref).toBeDefined();
    expect(ref!.info.title).toStrictEqual('Test1Document');
  });

  it('Should add pre build ApiDocument into references', async () => {
    const test1Doc = await ApiDocumentFactory.createDocument({
      spec: OpraSchema.SpecVersion,
      info: {
        title: 'Test1Document',
      },
    });
    const doc = await ApiDocumentFactory.createDocument({
      spec: OpraSchema.SpecVersion,
      references: {
        test1: test1Doc,
      },
    });
    expect(doc).toBeDefined();
    expect(doc).toBeInstanceOf(ApiDocument);
    expect(doc.references.size).toEqual(2);
    const ref = doc.references.get('test1');
    expect(ref).toEqual(test1Doc);
  });

  it('Should import types', async () => {
    const doc = await ApiDocumentFactory.createDocument({
      spec: OpraSchema.SpecVersion,
      types: {
        type1: {
          kind: 'SimpleType',
          base: 'string',
        },
      },
    });
    expect(doc).toBeDefined();
    expect(doc).toBeInstanceOf(ApiDocument);
    expect(doc.types.size).toEqual(1);
    expect(doc.node.findDataType('type1')).toBeDefined();
  });

  it('Should import http api', async () => {
    const doc = await ApiDocumentFactory.createDocument({
      spec: OpraSchema.SpecVersion,
      api: {
        protocol: 'http',
        description: 'Test api',
        name: 'Api1',
        controllers: {},
      },
    });
    expect(doc).toBeDefined();
    expect(doc).toBeInstanceOf(ApiDocument);
    expect(doc.api).toBeDefined();
    expect(doc.api!.description).toEqual('Test api');
  });

  it('Should throw OpraDocumentError on error', async () => {
    let error: OpraDocumentError;
    await expect(async () => {
      try {
        await ApiDocumentFactory.createDocument(
          {
            spec: OpraSchema.SpecVersion,
            references: {
              '12': {},
              '13': {},
            },
          },
          { maxErrors: 10 },
        );
      } catch (e: any) {
        error = e;
        throw e;
      }
    }).rejects.toThrow(OpraDocumentError);
    expect(error!.details.length).toBeGreaterThan(1);
  });
});
