import { Type } from 'ts-gems';
import { cloneObject, resolveClass, resolveThunk } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ThunkAsync } from '../../types.js';
import { METADATA_KEY } from '../constants.js';
import type { Collection } from '../resource/collection.js';
import type { Singleton } from '../resource/singleton.js';
import type { DocumentFactory } from './factory.js';

export async function importResourceClass(
    this: DocumentFactory,
    thunk: ThunkAsync<Type | object>
): Promise<void> {
  const {document, resourceQueue, cache} = this;
  const controller = await resolveThunk(thunk);
  const cached = cache.get(controller);
  if (cached)
    return cached;

  const ctor = typeof thunk === 'function' ? thunk : Object.getPrototypeOf(thunk).constructor;
  let metadata = Reflect.getMetadata(METADATA_KEY, ctor);
  if (!metadata && OpraSchema.isResource(metadata))
    throw new TypeError(`Class "${ctor.name}" doesn't have a valid Resource metadata`);

  // const controller = typeof thunk === 'function' ? new ctor() : thunk;

  // Clone metadata to prevent changing its contents
  metadata = cloneObject(metadata);
  const schema: any = cloneObject(metadata);
  schema.controller = controller;
  cache.set(thunk, schema);

  if (OpraSchema.isSingleton(schema) || OpraSchema.isCollection(schema)) {
    if (!document.getDataType(metadata.type, true) && (typeof metadata.type === 'function')) {
      await this.importTypeClass(metadata.type);
      await this.processTypes();
      const dataTypeCtor = await resolveClass(metadata.type);
      const dataType = document.getComplexType(dataTypeCtor);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      schema.type = dataType.name!;
    }
    // Check if data type exists
    document.getComplexType(schema.type);
  }

  if (OpraSchema.isSingleton(schema))
    await this.extractSingletonSchema(schema, ctor, metadata, controller);
  if (OpraSchema.isCollection(schema))
    await this.extractCollectionSchema(schema, ctor, metadata, controller);

  resourceQueue.set(metadata.name, schema);
}

export async function extractSingletonSchema(
    this: DocumentFactory,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    target: OpraSchema.Singleton, ctor: Type, metadata: Singleton.Metadata, controller: object | Type
): Promise<void> {
  // Do nothing. This method is used by external modules for extending the factory
}

export async function extractCollectionSchema(
    this: DocumentFactory,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    target: OpraSchema.Collection, ctor: Type, metadata: Collection.Metadata, controller: object | Type
): Promise<void> {
  // Do nothing. This method is used by external modules for extending the factory
}
