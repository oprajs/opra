import { OpraSchema } from '../../schema/index.js';
import { Collection } from '../resource/collection.js';
import { Singleton } from '../resource/singleton.js';
import type { DocumentFactory } from './factory.js';

export async function processResourceQueue(
    this: DocumentFactory
) {
  const {document, resourceQueue} = this;
  const resourceNames = Array.from(resourceQueue.keys());
  for (const name of resourceNames) {
    const schema = resourceQueue.get(name);
    if (!schema)
      continue;
    try {
      if (OpraSchema.isCollection(schema)) {
        const resource = await this.createCollection(name, schema);
        document.resources.set(name, resource);
        continue;
      }
      if (OpraSchema.isSingleton(schema)) {
        const resource = await this.createSingleton(name, schema);
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

export async function createCollection(
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

export async function createSingleton(
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
