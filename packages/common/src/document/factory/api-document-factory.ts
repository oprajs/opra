import { Type } from 'ts-gems';
import { cloneObject, resolveClass, resolveThunk, ResponsiveMap } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { ThunkAsync } from '../../types.js';
import { ApiDocument } from '../api-document.js';
import { RESOURCE_METADATA } from '../constants.js';
import { Collection } from '../resource/collection.js';
import { Singleton } from '../resource/singleton.js';
import { Storage } from '../resource/storage.js';
import { TypeDocumentFactory } from './type-document-factory.js';

export namespace ApiDocumentFactory {
  export interface InitArguments extends TypeDocumentFactory.InitArguments {
    resources?: ThunkAsync<Type | object>[] | Record<OpraSchema.Resource.Name, OpraSchema.Resource>;
  }
}

export class ApiDocumentFactory extends TypeDocumentFactory {
  protected resourceQueue = new ResponsiveMap<OpraSchema.Resource>();

  /**
   * Creates ApiDocument instance from given schema object
   * @param init
   */
  static async createDocument(init: ApiDocumentFactory.InitArguments): Promise<ApiDocument> {
    const factory = new ApiDocumentFactory();
    return factory.createDocument(init);
  }

  /**
   * Downloads schema from the given URL and creates the document instance   * @param url
   */
  static async createDocumentFromUrl(url: string): Promise<ApiDocument> {
    const factory = new ApiDocumentFactory();
    return factory.createDocumentFromUrl(url);
  }

  protected async createDocument(init: ApiDocumentFactory.InitArguments): Promise<ApiDocument> {
    await super.createDocument(init);
    if (init.resources) {
      this.curPath.push('resources');
      if (Array.isArray(init.resources)) {
        for (const res of init.resources)
          await this.importResourceClass(res);
      } else
        this.resourceQueue.setAll(init.resources);
      await this.processResourceQueue();
      this.curPath.pop();
    }
    this.document.resources.sort();
    return this.document;
  }

  protected async importResourceClass(thunk: ThunkAsync<Type | object>): Promise<void> {
    const {document, resourceQueue, cache} = this;
    const controller = await resolveThunk(thunk);
    const cached = cache.get(controller);
    if (cached)
      return cached;

    const ctor = typeof thunk === 'function' ? thunk : Object.getPrototypeOf(thunk).constructor;
    let metadata = Reflect.getMetadata(RESOURCE_METADATA, ctor);
    if (!metadata && OpraSchema.isSource(metadata))
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

  protected async extractSingletonSchema(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      target: OpraSchema.Singleton, ctor: Type, metadata: Singleton.Metadata, controller: object | Type
  ): Promise<void> {
    // Do nothing. This method is used by external modules for extending the factory
  }

  protected async extractCollectionSchema(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      target: OpraSchema.Collection, ctor: Type, metadata: Collection.Metadata, controller: object | Type
  ): Promise<void> {
    // Do nothing. This method is used by external modules for extending the factory
  }

  protected async processResourceQueue() {
    const {document, resourceQueue} = this;
    const sourceNames = Array.from(resourceQueue.keys());
    for (const name of sourceNames) {
      const schema = resourceQueue.get(name);
      if (!schema)
        continue;
      try {
        if (OpraSchema.isCollection(schema)) {
          const resource = await this.createCollectionResource(name, schema);
          document.resources.set(name, resource);
          continue;
        }
        if (OpraSchema.isSingleton(schema)) {
          const resource = await this.createSingletonResource(name, schema);
          document.resources.set(name, resource);
          continue;
        }
        if (OpraSchema.isStorage(schema)) {
          const resource = await this.createStorageResource(name, schema);
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

  protected async createCollectionResource(name: string, schema: OpraSchema.Collection): Promise<Collection> {
    const {document} = this;
    const dataType = document.getComplexType(schema.type);
    const initArgs: Collection.InitArguments = {
      ...schema,
      name,
      type: dataType
    }
    return new Collection(document, initArgs);
  }

  protected async createSingletonResource(name: string, schema: OpraSchema.Singleton): Promise<Singleton> {
    const {document} = this;
    const dataType = document.getComplexType(schema.type);
    const initArgs: Singleton.InitArguments = {
      ...schema,
      name,
      type: dataType
    }
    return new Singleton(document, initArgs);
  }

  protected async createStorageResource(name: string, schema: OpraSchema.Storage): Promise<Storage> {
    const {document} = this;
    const initArgs: Storage.InitArguments = {
      ...schema,
      name
    }
    return new Storage(document, initArgs);
  }

}
