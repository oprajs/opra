import { StrictOmit, Type } from 'ts-gems';
import { cloneObject, resolveThunk, ResponsiveMap } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { ThunkAsync } from '../../types.js';
import { ApiDocument } from '../api-document.js';
import { RESOURCE_METADATA } from '../constants.js';
import { ComplexType } from '../data-type/complex-type.js';
import { EnumType } from '../data-type/enum-type.js';
import { Collection } from '../resource/collection.js';
import { CollectionDecorator } from '../resource/collection-decorator.js';
import { Container } from '../resource/container.js';
import { Parameter } from '../resource/parameter.js';
import { Resource } from '../resource/resource.js';
import { ResourceDecorator } from '../resource/resource-decorator.js';
import { Singleton } from '../resource/singleton.js';
import { SingletonDecorator } from '../resource/singleton-decorator.js';
import { Storage } from '../resource/storage.js';
import { StorageDecorator } from '../resource/storage-decorator.js';
import { TypeDocumentFactory } from './type-document-factory.js';

export namespace ApiDocumentFactory {

  export interface ContainerInit extends StrictOmit<OpraSchema.Container, 'kind' | 'resources'> {
    resources?: ThunkAsync<Type | object>[] | Record<OpraSchema.Resource.Name, OpraSchema.Resource>;
  }

  export interface InitArguments extends TypeDocumentFactory.InitArguments {
    root?: ContainerInit;
  }

  export type DataTypeInitializer = TypeDocumentFactory.DataTypeInitializer;
}

/**
 * @class ApiDocumentFactory
 */
export class ApiDocumentFactory extends TypeDocumentFactory {
  protected document: ApiDocument;
  protected resourceQueue = new ResponsiveMap<any>();

  /**
   * Creates ApiDocument instance from given schema object
   * @param init
   */
  static async createDocument(init: ApiDocumentFactory.InitArguments): Promise<ApiDocument> {
    const factory = new ApiDocumentFactory();
    const document = factory.document = new ApiDocument();
    await factory.initDocument(init);
    return document;
  }

  /**
   * Downloads schema from the given URL and creates the document instance   * @param url
   */
  static async createDocumentFromUrl(url: string): Promise<ApiDocument> {
    const factory = new ApiDocumentFactory();
    const document = factory.document = new ApiDocument();
    await factory.initDocumentFromUrl(url);
    return document;
  }

  protected async initDocument(init: ApiDocumentFactory.InitArguments): Promise<ApiDocument> {
    await super.initDocument(init);
    const processContainer = async (container: Container, containerInit: ApiDocumentFactory.ContainerInit) => {
      if (!containerInit.resources)
        return;
      if (Array.isArray(containerInit.resources)) {
        for (const thunk of containerInit.resources) {
          const initArguments = await this.importResourceClass(thunk);
          container.resources.set(initArguments.name, this.createResource(container, initArguments));
        }
      } else
        for (const [name, schema] of Object.entries(containerInit.resources)) {
          const initArguments = await this.importResourceSchema(name, schema);
          container.resources.set(initArguments.name, this.createResource(container, initArguments));
        }
      container.resources.sort();
    }
    if (init.root) {
      this.curPath.push('/root');
      await processContainer(this.document.root, init.root);
      this.curPath.pop();
      this.document.invalidate();
    }
    return this.document;
  }

  protected async importResourceSchema(name: string, schema: OpraSchema.Resource): Promise<Container.ResourceInitializer> {
    const convertEndpoints = async (source?: Record<string, OpraSchema.Endpoint | undefined>) => {
      if (!source)
        return;
      const output: any = {};
      for (const [kA, oA] of Object.entries(source)) {
        /* istanbul ignore next */
        if (!oA) continue;
        let parameters: Record<string, Parameter.InitArguments> | undefined;
        if (oA.parameters) {
          parameters = {};
          for (const [kP, oP] of Object.entries(oA.parameters)) {
            if ((oP as any).enum) {
              oP.type = EnumType((oP as any).enum, {name: kP + 'Enum'}) as any;
            }
            parameters[kP] = {
              ...oP,
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
    } else if (schema.kind === 'Singleton') {
      return {
        ...schema,
        kind: schema.kind,
        name,
        type: await this.importDataType(schema.type) as ComplexType,
        actions: await convertEndpoints(schema.actions),
        operations: await convertEndpoints(schema.operations as any),
      }
    } else if (schema.kind === 'Storage') {
      return {
        ...schema,
        name,
        actions: await convertEndpoints(schema.actions),
        operations: await convertEndpoints(schema.operations as any),
      }
    } else if (schema.kind === 'Container') {
      const resources: Container.ResourceInitializer[] = [];
      if (schema.resources) {
        for (const [k, o] of Object.entries(schema.resources)) {
          const rinit = await this.importResourceSchema(k, o)
          resources.push(rinit);
        }
      }
      return {
        ...schema,
        name,
        resources,
        actions: await convertEndpoints(schema.actions)
      }
    }
    throw new TypeError(`Can not import resource schema (${(schema as any).kind})`);
  }

  protected async importResourceClass(thunk: ThunkAsync<Type | object>): Promise<Container.ResourceInitializer> {
    thunk = await resolveThunk(thunk);
    const ctor = typeof thunk === 'function' ? thunk : Object.getPrototypeOf(thunk).constructor;
    const metadata: CollectionDecorator.Metadata | SingletonDecorator.Metadata | StorageDecorator.Metadata
        = Reflect.getMetadata(RESOURCE_METADATA, ctor);
    if (!metadata && OpraSchema.isResource(metadata))
      throw new TypeError(`Class "${ctor.name}" doesn't have a valid Resource metadata`);
    const instance = typeof thunk === 'object' ? thunk : undefined;

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
              type: await this.importDataType(oP.type || 'any')
            };
          }
        }
        output[kA] = {...oA, parameters};
      }
      return output;
    }

    // Clone metadata to prevent changing its contents
    const initArguments = cloneObject(metadata) as unknown as Container.ResourceInitializer;
    initArguments.controller = instance;
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
    } else if (initArguments.kind === 'Container') {
      const oldResources = initArguments.resources as any;
      if (Array.isArray(oldResources)) {
        initArguments.resources = [];
        for (const t of oldResources) {
          const rinit = await this.importResourceClass(t);
          initArguments.resources.push(rinit);
        }
      }
    }
    return initArguments;
  }

  protected createResource(container: Container, initArguments: Container.ResourceInitializer): Resource {
    if (initArguments.kind === 'Collection')
      return new Collection(container, initArguments);
    if (initArguments.kind === 'Singleton')
      return new Singleton(container, initArguments);
    if (initArguments.kind === 'Storage')
      return new Storage(container, initArguments);
    if (initArguments.kind === 'Container')
      return new Container(container, initArguments);
    else throw new Error(`Unknown resource type ${(initArguments as any).kind}`);
  }

}
