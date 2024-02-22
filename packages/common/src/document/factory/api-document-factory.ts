import { Type } from 'ts-gems';
import { cloneObject, resolveThunk, ResponsiveMap } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { ThunkAsync } from '../../types.js';
import { ApiDocument } from '../api-document.js';
import { RESOURCE_METADATA } from '../constants.js';
import { EnumType } from '../data-type/enum-type.js';
import { ApiParameter } from '../resource/api-parameter.js';
import { ApiResource } from '../resource/api-resource.js';
import { TypeDocumentFactory } from './type-document-factory.js';

export namespace ApiDocumentFactory {

  export interface InitArguments extends TypeDocumentFactory.InitArguments {
    root?: ThunkAsync<Type | object>;
  }

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
    if (init.root) {
      const rootInit = await this.importResource(init.root,
          {kind: OpraSchema.Resource.Kind, name: 'root'});
      this.document.root = new ApiResource(this.document, 'root', rootInit);
    }
    return this.document;
  }

  protected async importResource(
      thunk: ThunkAsync<Type | object | ApiResource.DecoratorMetadata | (ApiResource.InitArguments & { name: string })>,
      overwrite?: object
  ): Promise<ApiResource.InitArguments & { name: string }> {
    thunk = await resolveThunk(thunk);
    let ctor: Type;
    let metadata: ApiResource.DecoratorMetadata | (ApiResource.InitArguments & { name: string });
    let instance: any;
    // If thunk is a class
    if (typeof thunk === 'function') {
      ctor = thunk as Type;
      metadata = Reflect.getMetadata(RESOURCE_METADATA, ctor);
    } else {
      // If thunk is an instance of a class decorated with ApiResource()
      ctor = Object.getPrototypeOf(thunk).constructor;
      metadata = Reflect.getMetadata(RESOURCE_METADATA, ctor);
      if (!metadata) {
        metadata = thunk as ApiResource.DecoratorMetadata;
        if ((thunk as any).controller === 'object') {
          instance = (thunk as any).controller;
          ctor = Object.getPrototypeOf(instance).constructor;
        }
      }
    }
    if (!metadata)
      throw new TypeError(`Class "${ctor.name}" is not decorated with ApiResource()`);
    if (overwrite)
      metadata = {...metadata, ...overwrite};
    if (!metadata.name)
      throw new TypeError(`Resource name required`);

    // Clone metadata to prevent changing its contents
    const resourceInit = cloneObject<ApiResource.InitArguments & { name: string }>(metadata as any);
    resourceInit.controller = instance;
    resourceInit.ctor = ctor;
    if (resourceInit.key)
      resourceInit.name += '@';

    // Transform endpoints
    if (metadata.endpoints) {
      for (const [endpointName, endpointMeta] of Object.entries(metadata.endpoints)) {
        if (endpointMeta.useTypes) {
          for (const t of endpointMeta.useTypes) {
            await this.importDataType(t);
          }
        }
        const endpointInit = resourceInit.endpoints![endpointName] = cloneObject(endpointMeta);
        // Resolve lazy type
        if (endpointMeta.response?.type) {
          endpointInit.response!.type = await this.importDataType((endpointMeta as any).response.type);
        }
        if (endpointMeta.parameters) {
          // noinspection JSMismatchedCollectionQueryUpdate
          const parameters: ApiParameter.InitArguments[] = endpointInit.parameters = [];
          for (const oP of endpointMeta.parameters) {
            if (oP.enum) {
              oP.type = EnumType(oP.enum, {name: oP.name + 'Enum'}) as any;
              delete oP.enum;
            }
            parameters.push({
              ...oP,
              type: await this.importDataType(oP.type || 'any')
            });
          }
        }

      }
    }

    if (metadata.resources) {
      const resources = resourceInit.resources = {};
      if (Array.isArray(metadata.resources)) {
        for (const t of metadata.resources) {
          const r = await this.importResource(t);
          resources[r.name] = r;
        }
      } else {
        for (const [name, meta] of Object.entries(metadata.resources)) {
          const r = await this.importResource(meta, {name});
          resources[r.name] = r;
        }
      }
    }
    return resourceInit;
  }

}
