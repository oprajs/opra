/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Collection,
  DocumentFactory,
  OpraSchema, Singleton,
} from '@opra/common';
import { Country } from '../../_support/test-api/index.js';

describe('DocumentFactory - init resources with with schema object', function () {

  const baseArgs: DocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    }
  };

  describe('Collection', function () {

    it('Should add Collection resource', async () => {
      const resource1: OpraSchema.Collection = {
        kind: 'Collection',
        description: 'test type',
        type: 'Country',
        primaryKey: 'code',
        operations: {
        }
      };
      const doc = await DocumentFactory.createDocument({
        ...baseArgs,
        types: [Country],
        resources: {
          resource1
        }
      })
      expect(doc).toBeDefined();
      const t = doc.resources.get('resource1') as Collection;
      expect(t).toBeDefined();
      expect(t.kind).toStrictEqual(OpraSchema.Collection.Kind);
      expect(t.name).toStrictEqual('resource1');
      expect(t.description).toEqual(resource1.description);
      expect(t.primaryKey).toStrictEqual([resource1.primaryKey]);
      expect(t.type.name).toEqual(resource1.type);
      expect(t.operations).toEqual(resource1.operations);
    })

  })

  describe('Singleton', function () {

    it('Should add Singleton resource', async () => {
      const resource1: OpraSchema.Singleton = {
        kind: 'Singleton',
        description: 'test type',
        type: 'Country',
        operations: {
        }
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

  })


});
