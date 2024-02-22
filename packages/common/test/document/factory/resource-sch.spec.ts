/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ApiDocumentFactory, OpraSchema, } from '@opra/common';
import { Country } from '../../_support/test-api/index';

describe('ApiDocumentFactory - Collection resource with schema object', function () {

  const baseArgs: ApiDocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    }
  };

  afterAll(() => global.gc && global.gc());

  it('Should import resource schema', async () => {
    const resource1: OpraSchema.Resource = {
      kind: 'Resource',
      description: 'test type',
      key: {
        name: 'id',
        type: 'string'
      }
    };
    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      types: [Country],
      root: {
        resources: {
          resource1
        }
      }
    })
    expect(doc).toBeDefined();
    const t = doc.getResource('resource1@');
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual(OpraSchema.Resource.Kind);
    expect(t.name).toStrictEqual('resource1@');
    expect(t.description).toEqual(resource1.description);
    expect(t.key).toBeDefined();
    expect(t.key?.name).toStrictEqual('id');
    expect(t.key?.type).toBeDefined();
    expect(t.key?.type.name).toStrictEqual('string');
  })

  it('Should import operation endpoint', async () => {
    const resource1: OpraSchema.Resource = {
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
      root: {
        resources: {
          resource1
        }
      }
    })
    expect(doc).toBeDefined();
    const t = doc.getResource('resource1');
    expect(t).toBeDefined();
    expect(t.getOperation('create')).toBeDefined();
    expect(t.getOperation('create').method).toStrictEqual('POST');
  })

  it('Should import action endpoint', async () => {
    const resource1: OpraSchema.Resource = {
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
      root: {
        resources: {
          resource1
        }
      }
    })
    expect(doc).toBeDefined();
    const t = doc.getResource('resource1');
    expect(t).toBeDefined();
    expect(t.getAction('ping')).toBeDefined();
  })

});
