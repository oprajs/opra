import { OpraSchema } from '../../schema/index.js';
import { Collection } from '../source/collection.js';
import { Singleton } from '../source/singleton.js';
import { Storage } from '../source/storage.js';
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
        const source = await this.createCollectionSource(name, schema);
        document.sources.set(name, source);
        continue;
      }
      if (OpraSchema.isSingleton(schema)) {
        const source = await this.createSingletonSource(name, schema);
        document.sources.set(name, source);
        continue;
      }
      if (OpraSchema.isStorage(schema)) {
        const source = await this.createFileSource(name, schema);
        document.sources.set(name, source);
        continue;
      }

    } catch (e: any) {
      e.message = `Error in Source schema (${name}): ` + e.message;
      throw e;
    }

    throw new TypeError(`Invalid Source schema: ${JSON.stringify(schema).substring(0, 20)}...`);
  }
}

export async function createCollectionSource(
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

export async function createSingletonSource(
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

export async function createStorageSource(
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
