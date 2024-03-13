/* eslint-disable @typescript-eslint/no-non-null-assertion */
import assert from 'assert';
import { ApiDocumentFactory, OpraSchema, } from '@opra/common';
import { Country } from '../../../_support/test-api/index.js';

describe('ApiDocumentFactory - Collection resource with schema object', function () {

  const baseArgs: ApiDocumentFactory.InitArguments = {
    spec: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    }
  };

  afterAll(() => global.gc && global.gc());

  it('Should import resource schema', async () => {
    const resource1: OpraSchema.Http.Resource = {
      kind: 'Resource',
      description: 'test type',
      keyParameter: {
        name: 'id',
        type: 'string'
      }
    };
    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      types: [Country],
      api: {
        protocol: 'http',
        name: 'TestService',
        root: {
          resources: {resource1}
        }
      }
    })
    expect(doc).toBeDefined();
    expect(doc.api).toBeDefined();
    const t = doc.api!.root.getResource('resource1@');
    expect(t).toBeDefined();
    assert(t);
    expect(t.kind).toStrictEqual(OpraSchema.Http.Resource.Kind);
    expect(t.name).toStrictEqual('resource1@');
    expect(t.description).toEqual(resource1.description);
    expect(t.keyParameter).toBeDefined();
    expect(t!.keyParameter?.name).toStrictEqual('id');
    expect(t.keyParameter?.type).toBeDefined();
    expect(t.keyParameter?.type!.name).toStrictEqual('string');
  })

  it('Should import operation endpoint', async () => {
    const resource1: OpraSchema.Http.Resource = {
      kind: 'Resource',
      description: 'test type',
      endpoints: {
        create: {
          kind: 'Operation',
          method: 'POST'
        }
      }
    };
    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      types: [Country],
      api: {
        protocol: 'http',
        name: 'TestService',
        root: {
          resources: {resource1}
        }
      }
    })
    expect(doc).toBeDefined();
    expect(doc.api).toBeDefined();
    const t = doc.api!.root.getResource('resource1');
    expect(t).toBeDefined();
    assert(t);
    expect(t.getOperation('create')).toBeDefined();
    expect(t.getOperation('create')!.method).toStrictEqual('POST');
  })

  it('Should import action endpoint', async () => {
    const resource1: OpraSchema.Http.Resource = {
      kind: 'Resource',
      description: 'test type',
      endpoints: {
        ping: {
          kind: 'Action'
        }
      }
    };
    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      types: [Country],
      api: {
        protocol: 'http',
        name: 'TestService',
        root: {
          resources: {resource1}
        }
      }
    })
    expect(doc).toBeDefined();
    expect(doc.api).toBeDefined();
    const t = doc.api!.root.getResource('resource1');
    expect(t).toBeDefined();
    assert(t);
    expect(t.getAction('ping')).toBeDefined();
  })

});
