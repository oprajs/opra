/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  DocumentFactory,
  OpraSchema, Singleton,
} from '@opra/common';
import { Country } from '../../_support/test-api/index.js';

describe('DocumentFactory - Singleton resource with schema object', function () {

  const baseArgs: DocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    }
  };

  it('Should add Singleton resource', async () => {
    const resource1: OpraSchema.Singleton = {
      kind: 'Singleton',
      description: 'test type',
      type: 'Country',
      operations: {}
    };
    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      types: [Country],
      resources: {
        resource1
      }
    })
    expect(doc).toBeDefined();
    const t = doc.resources.get('resource1') as Singleton;
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual(OpraSchema.Singleton.Kind);
    expect(t.name).toStrictEqual('resource1');
    expect(t.description).toEqual(resource1.description);
    expect(t.type.name).toEqual(resource1.type);
    expect(t.operations).toEqual(resource1.operations);
  })

});
