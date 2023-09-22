/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiDocumentFactory,
  OpraSchema, Storage,
} from '@opra/common';

describe('ApiDocumentFactory - Storage resource with schema object', function () {

  const baseArgs: ApiDocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    }
  };

  it('Should add Storage resource', async () => {
    const resource1: OpraSchema.Storage = {
      kind: 'Storage',
      description: 'test type',
      operations: {}
    };
    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      root: {
        resources: {
          resource1
        }
      }
    })
    expect(doc).toBeDefined();
    const t = doc.getResource('resource1', true) as Storage;
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual(OpraSchema.Storage.Kind);
    expect(t.name).toStrictEqual('resource1');
    expect(t.description).toEqual(resource1.description);
  })

});
