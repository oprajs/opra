import { Type } from 'ts-gems';
import { cloneObject, resolveThunk, ResponsiveMap } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { ThunkAsync } from '../../types.js';
import { ApiDocument } from '../api-document.js';
import { RESOURCE_METADATA } from '../constants.js';
import { EnumType } from '../data-type/enum-type.js';
import { ApiMediaContent } from '../resource/api-media-content';
import { ApiParameter } from '../resource/api-parameter.js';
import { ApiResource } from '../resource/api-resource.js';
import { ApiResponse } from '../resource/api-response';
import { TypeDocumentFactory } from './type-document-factory.js';

export namespace ApiDocumentFactory {

  export interface InitArguments extends TypeDocumentFactory.InitArguments {
    root?: ThunkAsync<Type | object>;
  }

  export interface Options {
    autoImportTypes?: boolean;
  }

}

/**
 * @class ApiDocumentFactory
 */
export class ApiDocumentFactory extends TypeDocumentFactory {
  protected document: ApiDocument;
  protected autoImportTypes?: boolean;

  /**
   * Creates ApiDocument instance from given schema object
   */
  static async createDocument(init: ApiDocumentFactory.InitArguments, options?: ApiDocumentFactory.Options): Promise<ApiDocument> {
    const factory = new ApiDocumentFactory();
    factory.autoImportTypes = options?.autoImportTypes;
    const document = factory.document = new ApiDocument();
    await factory.initDocument(init);
    return document;
  }

  /**
   * Downloads schema from the given URL and creates the document instance   * @param url
   */
  static async createDocumentFromUrl(url: string, options?: ApiDocumentFactory.Options): Promise<ApiDocument> {
    const factory = new ApiDocumentFactory();
    factory.autoImportTypes = options?.autoImportTypes;
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
    if (resourceInit.keyParameter)
      resourceInit.name += '@';

    // Transform endpoints
    if (metadata.endpoints) {
      for (const [endpointName, endpointMeta] of Object.entries(metadata.endpoints)) {
        const endpointInit = resourceInit.endpoints![endpointName] = {
          ...endpointMeta
        };

        // Clone parameters
        if (endpointInit.parameters) {
          // noinspection JSMismatchedCollectionQueryUpdate
          const parameters: ApiParameter.InitArguments[] = endpointInit.parameters = [];
          for (const oP of endpointMeta.parameters) {
            const prm = {...oP};
            if (prm.enum) {
              prm.type = EnumType(prm.enum, {name: prm.name + 'Enum'}) as any;
              delete prm.enum;
            } else if (prm.type && this.autoImportTypes) {
              prm.type = await this.importDataType(oP.type);
            }
            parameters.push(prm);
          }
        }

        // Clone responses
        if (endpointInit.responses) {
          // noinspection JSMismatchedCollectionQueryUpdate
          const responses: ApiResponse.InitArguments[] = endpointInit.responses = [];
          for (const oP of endpointMeta.responses) {
            const response = {...oP};
            if (response.type && this.autoImportTypes) {
              response.type = await this.importDataType(response.type);
            }
            responses.push(response);
          }
        }

        // Clone requestBody
        if (endpointInit.kind === OpraSchema.Operation.Kind) {
          if (endpointMeta.requestBody) {
            endpointInit.requestBody = {...endpointMeta.requestBody};
            if (endpointInit.requestBody.content) {
              endpointInit.requestBody.content = [];
              const processContent = async (src: ApiMediaContent.DecoratorMetadata): Promise<ApiMediaContent.InitArguments> => {
                const content = {...src} as ApiMediaContent.InitArguments;
                if (src.type && this.autoImportTypes)
                  content.type = await this.importDataType(src.type);
                if (src.examples)
                  content.examples = {...src.examples};
                if (src.multipartFields) {
                  content.multipartFields = {};
                  for (const [k, p] of Object.entries(src.multipartFields)) {
                    content.multipartFields[k] = await processContent(p);
                  }
                }
                return content;
              }
              for (const oP of endpointMeta.requestBody.content) {
                const content = await processContent(oP);
                endpointInit.requestBody.content.push(content);
              }
            }
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
