import { OpraSchema } from '../../schema/index.js';
import { Collection } from '../resource/collection.js';
import { Singleton } from '../resource/singleton.js';
import { Storage } from '../resource/storage.js';
import type { DocumentFactory } from './factory.js';

export async function processSourceQueue(
    this: DocumentFactory
) {
  const {document, sourceQueue} = this;
  const sourceNames = Array.from(sourceQueue.keys());
  for (const name of sourceNames) {
    const schema = sourceQueue.get(name);
    if (!schema)
      continue;
    try {
      if (OpraSchema.isCollection(schema)) {
        const resource = await this.createCollectionSource(name, schema);
        document.resources.set(name, resource);
        continue;
      }
      if (OpraSchema.isSingleton(schema)) {
        const resource = await this.createSingletonSource(name, schema);
        document.resources.set(name, resource);
        continue;
      }
      if (OpraSchema.isStorage(schema)) {
        const resource = await this.createFileSource(name, schema);
        document.resources.set(name, resource);
        continue;
      }

    } catch (e: any) {
      e.message = `Error in Resource schema (${name}): ` + e.message;
      throw e;
    }

    throw new TypeError(`Invalid Resource schema: ${JSON.stringify(schema).substring(0, 20)}...`);
  }
}

export async function createCollectionResource(
    this: DocumentFactory,
    name: string,
    schema: OpraSchema.Collection
): Promise<Collection> {
  const {document} = this;
  const dataType = document.getComplexType(schema.type);
  const initArgs: Collection.InitArguments = {
    ...schema,
    name,
    type: dataType
  }
  return new Collection(document, initArgs);
}

export async function createSingletonResource(
    this: DocumentFactory,
    name: string,
    schema: OpraSchema.Singleton
): Promise<Singleton> {
  const {document} = this;
  const dataType = document.getComplexType(schema.type);
  const initArgs: Singleton.InitArguments = {
    ...schema,
    name,
    type: dataType
  }
  return new Singleton(document, initArgs);
}

export async function createStorageResource(
    this: DocumentFactory,
    name: string,
    schema: OpraSchema.Storage
): Promise<Storage> {
  const {document} = this;
  const initArgs: Storage.InitArguments = {
    ...schema,
    name
  }
  return new Storage(document, initArgs);
}
