/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiDocumentFactory, Container,
  OpraSchema, Singleton,
} from '@opra/common';
import { Country } from '../../../_support/test-api/index.js';

describe('ApiDocumentFactory - Container resource with schema object', function () {

  const baseArgs: ApiDocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    }
  };

  it('Should add Container resource', async () => {
    const resource1: OpraSchema.Container = {
      kind: 'Container',
      description: 'test type'
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
    const t = doc.getResource('resource1', true) as Container;
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual(OpraSchema.Container.Kind);
    expect(t.name).toStrictEqual('resource1');
    expect(t.description).toEqual(resource1.description);
  })

  it('Should add Container resource with sub resources', async () => {
    const resource1: OpraSchema.Container = {
      kind: 'Container',
      description: 'test type',
      resources: {
        MyCountry: {
          kind: 'Singleton',
          description: 'test type',
          type: 'Country',
          operations: {}
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
    const t = doc.getResource('resource1', true) as Container;
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual(OpraSchema.Container.Kind);
    expect(t.name).toStrictEqual('resource1');
    expect(t.description).toEqual(resource1.description);
    expect(t.resources.get('MyCountry')).toBeDefined();
    expect(doc.getResource('resource1/MyCountry')).toBeInstanceOf(Singleton);
  })

});
