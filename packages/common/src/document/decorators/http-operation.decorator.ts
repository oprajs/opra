import type { StrictOmit, Type, TypeThunkAsync } from 'ts-gems';
import { MimeTypes } from '../../enums/index.js';
import { OpraSchema } from '../../schema/index.js';
import { HTTP_CONTROLLER_METADATA } from '../constants.js';
import type { HttpController } from '../http/http-controller.js';
import { HttpMediaType } from '../http/http-media-type.js';
import { HttpMultipartField } from '../http/http-multipart-field.js';
import type { HttpOperation } from '../http/http-operation.js';
import type { HttpOperationResponse } from '../http/http-operation-response.js';
import type { HttpParameter } from '../http/http-parameter.js';

export interface HttpOperationDecorator {
  (target: Object, propertyKey: string): void;

  Cookie(
    name: string | RegExp,
    optionsOrType?:
      | StrictOmit<HttpParameter.Options, 'location'>
      | string
      | Type,
  ): this;

  Header(
    name: string | RegExp,
    optionsOrType?:
      | StrictOmit<HttpParameter.Options, 'location'>
      | string
      | TypeThunkAsync,
  ): this;

  QueryParam(
    name: string | RegExp,
    optionsOrType?:
      | StrictOmit<HttpParameter.Options, 'location'>
      | string
      | TypeThunkAsync,
  ): this;

  PathParam(
    name: string | RegExp,
    optionsOrType?:
      | StrictOmit<HttpParameter.Options, 'location'>
      | string
      | TypeThunkAsync,
  ): this;

  RequestContent(type: string | Type): this;

  RequestContent(options: HttpMediaType.Options): this;

  MultipartContent(
    options?: HttpMediaType.Options,
    subInit?: (content: MultipartContentScope) => void,
  ): this;

  Response(
    status: number | string | (number | string)[],
    options?: HttpOperationResponse.Options,
  ): this;

  UseType(...type: Type[]): this;
}

export interface MultipartContentScope {
  Field(
    fieldName: string | RegExp,
    options?: StrictOmit<HttpMultipartField.Options, 'fieldName' | 'fieldType'>,
  ): MultipartContentScope;

  File(
    fieldName: string | RegExp,
    options?: StrictOmit<HttpMultipartField.Options, 'fieldName' | 'fieldType'>,
  ): MultipartContentScope;
}

export interface HttpOperationDecoratorFactory {
  /**
   * Property decorator
   * @param decoratorChain
   * @param options
   */ <T extends HttpOperation.Options>(
    decoratorChain: Function[],
    options?: T,
  ): HttpOperationDecorator;
}

export function HttpOperationDecoratorFactory(
  decoratorChain: Function[],
  options?: HttpOperation.Options &
    Pick<HttpOperation.Metadata, 'composition' | 'compositionOptions'>,
): HttpOperationDecorator {
  /**
   *
   */
  const decorator = ((target: Object, propertyKey: any): void => {
    if (typeof propertyKey !== 'string')
      throw new TypeError(`Symbol properties can not be decorated`);

    const operationMetadata = {
      ...options,
      kind: OpraSchema.HttpOperation.Kind,
    } as HttpOperation.Metadata;

    const controllerMetadata = (Reflect.getOwnMetadata(
      HTTP_CONTROLLER_METADATA,
      target.constructor,
    ) || {}) as HttpController.Metadata;
    controllerMetadata.operations = controllerMetadata.operations || {};
    controllerMetadata.operations[propertyKey] = operationMetadata;
    for (const fn of decoratorChain) fn(operationMetadata);
    Reflect.defineMetadata(
      HTTP_CONTROLLER_METADATA,
      controllerMetadata,
      target.constructor,
    );
  }) as HttpOperationDecorator;

  /**
   *
   */
  decorator.Cookie = (
    name: string | RegExp,
    arg1?: StrictOmit<HttpParameter.Options, 'location'> | string | Type,
  ) => {
    decoratorChain.push((meta: HttpOperation.Metadata): void => {
      const paramMeta: HttpParameter.Metadata =
        typeof arg1 === 'string' || typeof arg1 === 'function'
          ? {
              name,
              location: 'cookie',
              type: arg1,
            }
          : { ...arg1, name, location: 'cookie' };
      if (meta.parameters) {
        meta.parameters = meta.parameters.filter(
          p => !(p.location === 'cookie' && String(p.name) === String(name)),
        );
      } else meta.parameters = [];
      meta.parameters.push(paramMeta);
    });
    return decorator;
  };

  /**
   *
   */
  decorator.Header = (
    name: string | RegExp,
    arg1?: StrictOmit<HttpParameter.Options, 'location'> | string | Type,
  ) => {
    decoratorChain.push((meta: HttpOperation.Metadata): void => {
      const paramMeta: HttpParameter.Metadata =
        typeof arg1 === 'string' || typeof arg1 === 'function'
          ? {
              name,
              location: 'header',
              type: arg1,
            }
          : { ...arg1, name, location: 'header' };
      if (meta.parameters) {
        meta.parameters = meta.parameters.filter(
          p => !(p.location === 'header' && String(p.name) === String(name)),
        );
      } else meta.parameters = [];
      meta.parameters.push(paramMeta);
    });
    return decorator;
  };

  /**
   *
   */
  decorator.QueryParam = (
    name: string | RegExp,
    arg1?: StrictOmit<HttpParameter.Options, 'location'> | string | Type,
  ) => {
    decoratorChain.push((meta: HttpOperation.Metadata): void => {
      const paramMeta: HttpParameter.Metadata =
        typeof arg1 === 'string' || typeof arg1 === 'function'
          ? {
              name,
              location: 'query',
              type: arg1,
            }
          : { ...arg1, name, location: 'query' };
      if (meta.parameters) {
        meta.parameters = meta.parameters.filter(
          p => !(p.location === 'query' && String(p.name) === String(name)),
        );
      } else meta.parameters = [];
      meta.parameters.push(paramMeta);
    });
    return decorator;
  };

  /**
   *
   */
  decorator.PathParam = (
    name: string | RegExp,
    arg1?: StrictOmit<HttpParameter.Options, 'location'> | string | Type,
  ) => {
    decoratorChain.push((meta: HttpOperation.Metadata): void => {
      const paramMeta: HttpParameter.Metadata =
        typeof arg1 === 'string' || typeof arg1 === 'function'
          ? {
              name,
              location: 'path',
              type: arg1,
            }
          : { ...arg1, name, location: 'path' };
      if (meta.parameters) {
        meta.parameters = meta.parameters.filter(
          p => !(p.location === 'path' && String(p.name) === String(name)),
        );
      } else meta.parameters = [];
      meta.parameters.push(paramMeta);
    });
    return decorator;
  };

  /**
   *
   */
  decorator.Response = (
    statusCode: number | string | (number | string)[],
    responseOptions?: HttpOperationResponse.Options,
  ): any => {
    const responseMeta: HttpOperationResponse.Metadata = {
      ...responseOptions,
      statusCode,
    };
    if (responseMeta.type) {
      responseMeta.contentType =
        responseMeta.contentType || MimeTypes.opra_response_json;
      responseMeta.contentEncoding = responseMeta.contentEncoding || 'utf-8';
    }
    if (responseMeta.contentType === MimeTypes.opra_response_json) {
      responseMeta.contentEncoding = responseMeta.contentEncoding || 'utf-8';
    }
    decoratorChain.push((meta: HttpOperation.Metadata): void => {
      meta.responses = meta.responses || [];
      meta.responses.push(responseMeta);
    });
    return decorator;
  };

  decorator.RequestContent = function (arg0: any) {
    const contentMeta: HttpMediaType.Metadata =
      typeof arg0 === 'object' ? arg0 : { type: arg0 };
    if (contentMeta.type) {
      contentMeta.contentType = contentMeta.contentType || MimeTypes.json;
      contentMeta.contentEncoding = contentMeta.contentEncoding || 'utf-8';
    }
    decoratorChain.push((operationMetadata: HttpOperation.Metadata) => {
      operationMetadata.requestBody = operationMetadata.requestBody || {
        required: true,
        content: [],
      };
      operationMetadata.requestBody!.content =
        operationMetadata.requestBody!.content || [];
      operationMetadata.requestBody!.content.push(contentMeta);
    });
    return decorator;
  };

  decorator.MultipartContent = function (
    contentOpts?: HttpMediaType.Options,
    subInit?: (content: MultipartContentScope) => void,
  ) {
    const contentMetadata: HttpMediaType.Metadata = {
      ...contentOpts,
      contentType: contentOpts?.contentType || 'multipart/form-data',
    };
    decoratorChain.push((operationMetadata: HttpOperation.Metadata) => {
      operationMetadata.requestBody = operationMetadata.requestBody || {
        required: true,
        content: [],
      };
      operationMetadata.requestBody!.content =
        operationMetadata.requestBody!.content || [];
      operationMetadata.requestBody!.content.push(contentMetadata);
    });
    if (subInit) {
      const configScope: MultipartContentScope = {
        Field(
          fieldName: string | RegExp,
          opts?: StrictOmit<
            HttpMultipartField.Options,
            'fieldName' | 'fieldType'
          >,
        ) {
          contentMetadata.multipartFields =
            contentMetadata.multipartFields || [];
          contentMetadata.multipartFields.push({
            fieldName,
            fieldType: 'field',
            ...opts,
          });
          return configScope;
        },

        File(
          fieldName: string | RegExp,
          opts?: StrictOmit<
            HttpMultipartField.Options,
            'fieldName' | 'fieldType'
          >,
        ) {
          contentMetadata.multipartFields =
            contentMetadata.multipartFields || [];
          contentMetadata.multipartFields.push({
            fieldName,
            fieldType: 'file',
            ...opts,
          });
          return configScope;
        },
      };
      subInit(configScope);
    }
    return decorator;
  };

  /**
   *
   */
  decorator.UseType = (...type: Type[]): any => {
    decoratorChain.push((meta: HttpOperation.Metadata): void => {
      meta.types = meta.types || [];
      meta.types.push(...type);
    });
    return decorator;
  };

  return decorator;
}
