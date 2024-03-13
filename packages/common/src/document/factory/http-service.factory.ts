import { StrictOmit, Type } from 'ts-gems';
import { resolveThunk } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { ThunkAsync } from '../../types.js';
import { ApiDocument } from '../api-document.js';
import { RESOURCE_METADATA } from '../constants.js';
import { EnumType } from '../data-type/enum-type.js';
import { HttpAction } from '../http/http-action.js';
import { HttpMediaContent } from '../http/http-media-content.js';
import { HttpOperation } from '../http/http-operation.js';
import { HttpParameter } from '../http/http-parameter.js';
import { HttpResource } from '../http/http-resource.js';
import { HttpResponse } from '../http/http-response.js';
import { HttpService } from '../http/http-service.js';
import type { ApiDocumentFactory } from './api-document.factory';
import { DataTypeFactory } from './data-type.factory.js';

export namespace HttpServiceFactory {
  export interface InitArguments extends StrictOmit<OpraSchema.Http.Service, 'root'> {
    root: ThunkAsync<Type | object | HttpResource.InitArguments>
  }
}

/**
 * @class HttpServiceFactory
 */
export class HttpServiceFactory {

  static async createService(
      context: ApiDocumentFactory.Context,
      serviceName: string,
      init: HttpServiceFactory.InitArguments
  ): Promise<HttpService> {
    const factory = new HttpServiceFactory();
    const service = new HttpService(context.document, serviceName, init);
    service.root = await factory.createResource(context, context.document, init.root, 'root');
    return service;
  }

  protected async createResource(
      context: ApiDocumentFactory.Context,
      parent: ApiDocument | HttpResource,
      thunk: ThunkAsync<Type | object | HttpResource.DecoratorMetadata | HttpResource.InitArguments>,
      name?: string
  ): Promise<HttpResource> {
    thunk = await resolveThunk(thunk);
    let ctor: Type;
    let metadata: HttpResource.DecoratorMetadata;
    let instance: any;
    // If thunk is a class
    if (typeof thunk === 'function') {
      ctor = thunk as Type;
      metadata = Reflect.getMetadata(RESOURCE_METADATA, ctor);
    } else {
      // If thunk is an instance of a class decorated with HttpResource()
      ctor = Object.getPrototypeOf(thunk).constructor;
      metadata = Reflect.getMetadata(RESOURCE_METADATA, ctor);
      if (!metadata) {
        // If thunk is a DecoratorMetadata or InitArguments
        metadata = thunk as HttpResource.DecoratorMetadata;
        if ((thunk as any).controller === 'object') {
          instance = (thunk as any).controller;
          ctor = Object.getPrototypeOf(instance).constructor;
        }
      }
    }
    if (!metadata)
      throw new TypeError(`Class "${ctor.name}" is not decorated with HttpResource()`);
    name = name || metadata.name;
    if (!name)
      throw new TypeError(`Resource name required`);

    const resource = new HttpResource(parent, name, metadata);
    resource.ctor = ctor;
    if (metadata.types) {
      context.curPath.push('.types');
      const typeFactory = new DataTypeFactory(resource);
      await typeFactory.importAllDataTypes(context, metadata.types);
      context.curPath.pop();
    }

    if (metadata.keyParameter) {
      context.curPath.push('.keyParameter');
      const type = metadata.keyParameter.type
          ? resource.getDataType(metadata.keyParameter.type)
          : undefined;
      resource.setKeyParameter({...metadata.keyParameter, type});
      context.curPath.pop();
    }

    if (metadata.endpoints) {
      context.curPath.push('.endpoints');
      for (const [endpointName, endpointMeta] of Object.entries<any>(metadata.endpoints)) {
        context.curPath.push('.' + endpointName);
        // Create endpoint
        const endpoint = endpointMeta.kind === OpraSchema.Http.Action.Kind
            ? resource.addAction(endpointName, endpointMeta as HttpAction.InitArguments)
            : resource.addOperation(endpointName, endpointMeta as HttpOperation.InitArguments);

        const endpointTypeFactory = new DataTypeFactory(endpoint);
        if (endpointMeta.types) {
          context.curPath.push('.types');
          await endpointTypeFactory.importAllDataTypes(context, endpointMeta.types);
          context.curPath.pop();
        }

        // Process parameters
        if (endpointMeta.parameters?.length) {
          for (const oP of endpointMeta.parameters) {
            context.curPath.push(`.parameters[${oP.name}]`);
            const prmInit: HttpParameter.InitArguments = {...oP};
            if (prmInit.type) {
              context.curPath.push(`.type`);
              let typeDef: any = prmInit.type;
              if (oP.enum)
                typeDef = EnumType(oP.enum, {name: oP.name + 'Enum'}) as any;
              prmInit.type = await endpointTypeFactory.createDataType(context, typeDef);
              context.curPath.pop();
            }
            endpoint.defineParameter(prmInit.name, prmInit);
            context.curPath.pop();
          }
        }

        // Process requestBody
        if (endpoint instanceof HttpOperation && endpointMeta.requestBody) {
          context.curPath.push('.requestBody');
          const requestBodyInit = {
            ...endpointMeta.requestBody,
            content: []
          };
          if (endpointMeta.requestBody.content) {
            const processContent = async (src: HttpMediaContent.DecoratorMetadata): Promise<HttpMediaContent.InitArguments> => {
              const content = {...src} as HttpMediaContent.InitArguments;
              if (src.type) {
                context.curPath.push(`.type`);
                content.type = await endpointTypeFactory.createDataType(context, src.type);
                context.curPath.pop();
              }
              if (src.examples)
                content.examples = {...src.examples};
              if (src.multipartFields) {
                content.multipartFields = {};
                let i = 0;
                for (const [k, p] of Object.entries(src.multipartFields)) {
                  context.curPath.push(`.multipartFields[${i++}]`);
                  content.multipartFields[k] = await processContent(p);
                  context.curPath.pop();
                }
              }
              return content;
            }
            let i = 0;
            for (const src of endpointMeta.requestBody.content) {
              context.curPath.push(`.content[${i++}]`);
              const content = await processContent(src);
              requestBodyInit.content.push(content);
              context.curPath.pop();
            }
          }
          endpoint.setRequestBody(requestBodyInit);
          context.curPath.pop();
        }

        // Process responses
        if (endpointMeta.responses) {
          let i = 0;
          for (const src of endpointMeta.responses) {
            context.curPath.push(`.responses[${i++}]`);
            const responseInit: HttpResponse.InitArguments = {...src};
            if (src.type) {
              context.curPath.push(`.type`);
              responseInit.type = await endpointTypeFactory.createDataType(context, src.type);
              context.curPath.pop();
            }
            endpoint.defineResponse(responseInit);
            context.curPath.pop();
          }
        }

        context.curPath.pop();
      }
      context.curPath.pop();
    }

    if (metadata.resources) {
      if (Array.isArray(metadata.resources)) {
        for (const t of metadata.resources) {
          const r = await this.createResource(context, resource, t);
          resource.resources.set(r.name, r);
        }
      } else {
        for (const [k, meta] of Object.entries<any>(metadata.resources)) {
          const r = await this.createResource(context, resource, meta, k);
          resource.resources.set(r.name, r);
        }
      }
    }
    return resource;
  }


}
