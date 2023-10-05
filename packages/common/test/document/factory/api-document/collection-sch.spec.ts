/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiDocumentFactory,
  Collection,
  OpraSchema,
} from '@opra/common';
import { Country } from '../../../_support/test-api/index.js';

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

  it('Should add Collection resource', async () => {
    const resource1: OpraSchema.Collection = {
      kind: 'Collection',
      description: 'test type',
      type: 'Country',
      primaryKey: 'code',
      operations: {}
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
    const t = doc.root.resources.get('resource1') as Collection;
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual(OpraSchema.Collection.Kind);
    expect(t.name).toStrictEqual('resource1');
    expect(t.description).toEqual(resource1.description);
    expect(t.primaryKey).toStrictEqual([resource1.primaryKey]);
    expect(t.type.name).toEqual(resource1.type);
  })

});
