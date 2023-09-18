import { Type } from 'ts-gems';
import { cloneObject, resolveThunk, ResponsiveMap } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { ThunkAsync } from '../../types.js';
import { ApiDocument } from '../api-document.js';
import { RESOURCE_METADATA } from '../constants.js';
import { ComplexType } from '../data-type/complex-type.js';
import { EnumType } from '../data-type/enum-type.js';
import { Collection } from '../resource/collection.js';
import { CollectionDecorator } from '../resource/collection-decorator.js';
import { Parameter } from '../resource/parameter.js';
import { ResourceDecorator } from '../resource/resource.decorator.js';
import { SingletonDecorator } from '../resource/singleton.decorator.js';
import { Singleton } from '../resource/singleton.js';
import { StorageDecorator } from '../resource/storage.decorator.js';
import { Storage } from '../resource/storage.js';
import { TypeDocumentFactory } from './type-document-factory.js';

export namespace ApiDocumentFactory {
  export interface InitArguments extends TypeDocumentFactory.InitArguments {
    resources?: ThunkAsync<Type | object>[] | Record<OpraSchema.Resource.Name, OpraSchema.Resource>;
  }

  export type DataTypeInitializer = TypeDocumentFactory.DataTypeInitializer;
  export type ResourceInitializer =
      (Collection.InitArguments & { kind: OpraSchema.Collection.Kind })
      | (Singleton.InitArguments & { kind: OpraSchema.Singleton.Kind })
      | (Storage.InitArguments & { kind: OpraSchema.Storage.Kind });
}


export class ApiDocumentFactory extends TypeDocumentFactory {
  protected resourceQueue = new ResponsiveMap<any>();

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
      this.curPath.push('Resources->');
      if (Array.isArray(init.resources)) {
        for (const thunk of init.resources) {
          const initArguments = await this.importResourceClass(thunk);
          await this.addResource(initArguments);
        }
      } else
        for (const [name, schema] of Object.entries(init.resources)) {
          const initArguments = await this.importResourceSchema(name, schema);
          await this.addResource(initArguments);
        }
      this.document.resources.sort();
      this.curPath.pop();
      this.document.invalidate();
    }
    return this.document;
  }

  protected async importResourceSchema(name: string, schema: OpraSchema.Resource): Promise<ApiDocumentFactory.ResourceInitializer> {
    const convertEndpoints = async (source?: Record<string, OpraSchema.Endpoint>) => {
      if (!source)
        return;
      const output: any = {};
      for (const [kA, oA] of Object.entries(source)) {
        let parameters: Record<string, Parameter.InitArguments> | undefined;
        if (oA.parameters) {
          parameters = {};
          for (const [kP, oP] of Object.entries(oA.parameters)) {
            if ((oP as any).enum) {
              oP.type = EnumType((oP as any).enum, {name: kP + 'Enum'}) as any;
            }
            parameters[kP] = {
              ...oP,
              name: kP,
              type: await this.importDataType(oP.type || 'any')
            };
          }
        }
        output[kA] = {...oA[kA], parameters};
      }
      return output;
    }
    if (schema.kind === 'Collection') {
      return {
        ...schema,
        kind: schema.kind,
        name,
        type: await this.importDataType(schema.type) as ComplexType,
        actions: await convertEndpoints(schema.actions),
        operations: await convertEndpoints(schema.operations as any),
      }
    }
    if (schema.kind === 'Singleton') {
      return {
        ...schema,
        kind: schema.kind,
        name,
        type: await this.importDataType(schema.type) as ComplexType,
        actions: await convertEndpoints(schema.actions),
        operations: await convertEndpoints(schema.operations as any),
      }
    }
    if (schema.kind === 'Storage') {
      return {
        ...schema,
        name,
        actions: await convertEndpoints(schema.actions),
        operations: await convertEndpoints(schema.operations as any),
      }
    }
    throw new TypeError('Not implemented yet')
  }

  protected async importResourceClass(thunk: ThunkAsync<Type | object>): Promise<ApiDocumentFactory.ResourceInitializer> {
    thunk = await resolveThunk(thunk);
    const ctor = typeof thunk === 'function' ? thunk : Object.getPrototypeOf(thunk).constructor;
    const metadata: CollectionDecorator.Metadata | SingletonDecorator.Metadata | StorageDecorator.Metadata
        = Reflect.getMetadata(RESOURCE_METADATA, ctor);
    if (!metadata && OpraSchema.isResource(metadata))
      throw new TypeError(`Class "${ctor.name}" doesn't have a valid Resource metadata`);
    const controller = typeof thunk === 'object' ? thunk : undefined;

    const convertEndpoints = async (source?: Record<string, ResourceDecorator.EndpointMetadata>) => {
      if (!source)
        return;
      const output: any = {};
      for (const [kA, oA] of Object.entries(source)) {
        let parameters: Record<string, Parameter.InitArguments> | undefined;
        if (oA.parameters) {
          parameters = {};
          for (const [kP, oP] of Object.entries(oA.parameters)) {
            if (oP.enum) {
              oP.type = EnumType(oP.enum, {name: kP + 'Enum'}) as any;
            }
            parameters[kP] = {
              ...oP,
              name: kP,
              type: await this.importDataType(oP.type || 'any')
            };
          }
        }
        output[kA] = {...oA, parameters};
      }
      return output;
    }

    // Clone metadata to prevent changing its contents
    const initArguments = cloneObject(metadata) as unknown as ApiDocumentFactory.ResourceInitializer;
    initArguments.controller = controller;
    initArguments.ctor = ctor;
    if (initArguments.actions)
      initArguments.actions = await convertEndpoints(initArguments.actions as any);

    if (initArguments.kind === 'Collection' || initArguments.kind === 'Singleton') {
      const dataType = await this.importDataType((metadata as any).type);
      if (!dataType)
        throw new TypeError(`Unable to determine data type of "${initArguments.name}" resource`);
      if (!(dataType instanceof ComplexType))
        throw new TypeError(`Data type of "${initArguments.name}" is not a ComplexType`);
      initArguments.type = dataType;
      if (initArguments.operations)
        initArguments.operations = await convertEndpoints(initArguments.operations as any);
    }
    return initArguments;
  }

  protected async addResource(initArguments: ApiDocumentFactory.ResourceInitializer): Promise<void> {
    if (initArguments.kind === 'Collection') {
      this.document.resources.set(initArguments.name, new Collection(this.document, initArguments));
    } else if (initArguments.kind === 'Singleton') {
      this.document.resources.set(initArguments.name, new Singleton(this.document, initArguments));
    } else if (initArguments.kind === 'Storage') {
      this.document.resources.set(initArguments.name, new Storage(this.document, initArguments));
    }
  }

}
