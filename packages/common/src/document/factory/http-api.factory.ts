import { StrictOmit, Type } from 'ts-gems';
import { resolveThunk } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { ApiDocument } from '../api-document.js';
import { DocumentInitContext } from '../common/document-init-context.js';
import { HTTP_CONTROLLER_METADATA } from '../constants.js';
import { HttpApi } from '../http/http-api.js';
import { HttpController } from '../http/http-controller.js';
import { HttpMediaType } from '../http/http-media-type.js';
import { HttpMultipartField } from '../http/http-multipart-field.js';
import { HttpOperation } from '../http/http-operation.js';
import { HttpOperationResponse } from '../http/http-operation-response.js';
import { HttpParameter } from '../http/http-parameter.js';
import { HttpRequestBody } from '../http/http-request-body.js';
import { DataTypeFactory } from './data-type.factory.js';

export namespace HttpApiFactory {
  export interface InitArguments extends StrictOmit<OpraSchema.HttpApi, 'controllers'> {
    controllers: Type[] | any[] | OpraSchema.HttpApi['controllers'];
  }
}

/**
 * @class HttpApiFactory
 */
export class HttpApiFactory {
  /**
   * Generates HttpApi
   * @param context
   * @param document
   * @param init
   */
  static async createApi(
    context: DocumentInitContext,
    document: ApiDocument,
    init: HttpApiFactory.InitArguments,
  ): Promise<HttpApi> {
    const api = new HttpApi(document);
    api.description = init.description;
    api.url = init.url;
    if (init.controllers) {
      await context.enterAsync('.controllers', async () => {
        if (Array.isArray(init.controllers)) {
          for (const c of init.controllers) {
            const controller = await this._createController(context, api, c);
            if (controller) api.controllers.set(controller.name, controller);
          }
        } else {
          for (const [k, v] of Object.entries(init.controllers)) {
            const controller = await this._createController(context, api, v, k);
            if (controller) api.controllers.set(controller.name, controller);
          }
        }
      });
    }
    return api;
  }

  protected static async _createController(
    context: DocumentInitContext,
    parent: HttpApi | HttpController,
    thunk: Type | object | OpraSchema.HttpController,
    name?: string,
  ): Promise<HttpController | undefined | void> {
    thunk = await resolveThunk(thunk);
    let ctor: Type;
    let metadata: HttpController.Metadata | OpraSchema.HttpController;
    let instance: any;

    // If thunk is a class
    if (typeof thunk === 'function') {
      metadata = Reflect.getMetadata(HTTP_CONTROLLER_METADATA, thunk);
      if (!metadata) return context.addError(`Class "${thunk.name}" doesn't have a valid HttpController metadata`);
      ctor = thunk as Type;
    } else {
      // If thunk is an instance of a class decorated with HttpController()
      ctor = Object.getPrototypeOf(thunk).constructor;
      metadata = Reflect.getMetadata(HTTP_CONTROLLER_METADATA, ctor);
      if (!metadata) {
        // If thunk is a DecoratorMetadata or InitArguments
        metadata = thunk as HttpController.Metadata;
        if ((thunk as any).instance === 'object') {
          instance = (thunk as any).instance;
          ctor = Object.getPrototypeOf(instance).constructor;
        }
      }
    }
    if (!metadata) return context.addError(`Class "${ctor.name}" is not decorated with HttpController()`);
    instance = thunk;
    name = name || (metadata as any).name;
    if (!name) throw new TypeError(`Controller name required`);

    const controller = new HttpController(parent, {
      ...metadata,
      name,
      instance,
      ctor,
    });
    if (metadata.types) {
      await context.enterAsync('.types', async () => {
        await DataTypeFactory.addDataTypes(context, controller, metadata.types!);
      });
    }

    if (metadata.parameters) {
      await context.enterAsync('.parameters', async () => {
        let i = 0;
        for (const v of metadata.parameters!) {
          await context.enterAsync(`[${i++}]`, async () => {
            const prmArgs = { ...v } as HttpParameter.InitArguments;
            await context.enterAsync('.type', async () => {
              if (v.type) prmArgs.type = controller.node.findDataType(v.type);
              if (!prmArgs.type && typeof v.type === 'object') {
                prmArgs.type = await DataTypeFactory.createDataType(context, controller, v.type);
              }
              if (!prmArgs.type) prmArgs.type = controller.node.getDataType('any');
            });
            const prm = new HttpParameter(controller, prmArgs);
            controller.parameters.push(prm);
          });
        }
      });
    }

    if (metadata.operations) {
      await context.enterAsync('.operations', async () => {
        for (const [k, v] of Object.entries<any>(metadata.operations!)) {
          await context.enterAsync(`[${k}]`, async () => {
            const operation = new HttpOperation(controller, { name: k, method: 'GET' });
            await this._initHttpOperation(context, operation, v);
            controller.operations.set(k, operation);
          });
        }
      });
    }

    if (metadata.controllers) {
      await context.enterAsync('.controllers', async () => {
        if (Array.isArray(metadata.controllers)) {
          let k = 0;
          for (const v of metadata.controllers!) {
            await context.enterAsync(`[${k}]`, async () => {
              const r = await this._createController(context, controller, v);
              if (r) {
                if (controller.controllers.get(r.name)) context.addError(`Duplicate controller name (${r.name})`);
                controller.controllers.set(r.name, r);
              }
            });
            k++;
          }
        } else {
          for (const [k, v] of Object.entries<any>(metadata.controllers!)) {
            await context.enterAsync(`[${k}]`, async () => {
              const r = await this._createController(context, controller, v, k);
              if (r) {
                if (controller.controllers.get(r.name)) context.addError(`Duplicate controller name (${r.name})`);
                controller.controllers.set(r.name, r);
              }
            });
          }
        }
      });
    }

    return controller;
  }

  /**
   * Initializes HttpOperation
   * @param context
   * @param operation
   * @param metadata
   * @protected
   */
  protected static async _initHttpOperation(
    context: DocumentInitContext,
    operation: HttpOperation,
    metadata: HttpOperation.Metadata | OpraSchema.HttpOperation,
  ) {
    const initArgs: HttpOperation.InitArguments = {
      ...metadata,
      name: operation.name,
      types: undefined,
    };
    HttpOperation.apply(operation, [operation.owner, initArgs] as any);
    if (metadata.types) {
      await context.enterAsync('.types', async () => {
        await DataTypeFactory.addDataTypes(context, operation, metadata.types!);
      });
    }

    if (metadata.parameters) {
      await context.enterAsync('.parameters', async () => {
        let i = 0;
        for (const v of metadata.parameters!) {
          await context.enterAsync(`[${i++}]`, async () => {
            const prmArgs = { ...v } as HttpParameter.InitArguments;
            await context.enterAsync('.type', async () => {
              if (v.type) prmArgs.type = operation.node.findDataType(v.type);
              if (!prmArgs.type && typeof v.type === 'object') {
                prmArgs.type = await DataTypeFactory.createDataType(context, operation, v.type);
              }
              if (!prmArgs.type) prmArgs.type = operation.node.getDataType('any');
            });
            const prm = new HttpParameter(operation, prmArgs);
            operation.parameters.push(prm);
          });
        }
      });
    }

    if (metadata.responses) {
      await context.enterAsync('.responses', async () => {
        let i = 0;
        for (const v of metadata.responses!) {
          await context.enterAsync(`[${i++}]`, async () => {
            const response = new HttpOperationResponse(operation, { statusCode: v.statusCode });
            await this._initHttpOperationResponse(context, response, v);
            operation.responses.push(response);
          });
        }
      });
    }
    if (metadata.requestBody) {
      await context.enter('.requestBody', async () => {
        const requestBody = new HttpRequestBody(operation);
        await this._initHttpRequestBody(context, requestBody, metadata.requestBody!);
        operation.requestBody = requestBody;
      });
    }
    return operation;
  }

  /**
   * Initializes HttpMediaType
   * @param context
   * @param target
   * @param metadata
   * @protected
   */
  protected static async _initHttpMediaType(
    context: DocumentInitContext,
    target: HttpMediaType,
    metadata: HttpMediaType.Metadata | OpraSchema.HttpMediaType,
  ) {
    HttpMediaType.call(target, target.owner, {
      ...metadata,
      type: undefined,
      multipartFields: undefined,
    });
    if (metadata.type) {
      await context.enterAsync('.type', async () => {
        if (metadata.type) target.type = target.node.findDataType(metadata.type);
        if (!target.type && (typeof metadata.type === 'object' || typeof metadata.type === 'function')) {
          target.type = await DataTypeFactory.createDataType(context, target, metadata.type);
        }
        if (!target.type) target.type = target.node.getDataType('any');
      });
    }
    if (metadata.multipartFields) {
      await context.enterAsync('.multipartFields', async () => {
        for (let i = 0; i < metadata.multipartFields!.length; i++) {
          await context.enterAsync(`[${i}]`, async () => {
            const src = metadata.multipartFields![i];
            const field = new HttpMultipartField(target, { fieldName: src.fieldName, fieldType: src.fieldType });
            await this._initHttpMediaType(context, field, src);
            target.multipartFields.push(field);
          });
        }
      });
    }
  }

  /**
   * Initializes HttpOperationResponse
   * @param context
   * @param target
   * @param metadata
   * @protected
   */
  protected static async _initHttpOperationResponse(
    context: DocumentInitContext,
    target: HttpOperationResponse,
    metadata: HttpOperationResponse.Metadata | OpraSchema.HttpOperationResponse,
  ) {
    await this._initHttpMediaType(context, target, metadata);
    target.partial = metadata.partial;
    if (metadata.parameters) {
      await context.enterAsync('.parameters', async () => {
        let i = 0;
        for (const v of metadata.parameters!) {
          await context.enterAsync(`[${i++}]`, async () => {
            const prmArgs = { ...v } as HttpParameter.InitArguments;
            await context.enterAsync('.type', async () => {
              if (v.type) prmArgs.type = target.node.findDataType(v.type);
              if (!prmArgs.type && typeof v.type === 'object') {
                prmArgs.type = await DataTypeFactory.createDataType(context, target, v.type);
              }
              if (!prmArgs.type) prmArgs.type = target.node.getDataType('any');
            });
            const prm = new HttpParameter(target, prmArgs);
            target.parameters.push(prm);
          });
        }
      });
    }
  }

  /**
   * Initializes HttpRequestBody
   * @param context
   * @param target
   * @param metadata
   * @protected
   */
  protected static async _initHttpRequestBody(
    context: DocumentInitContext,
    target: HttpRequestBody,
    metadata: HttpRequestBody.Metadata | OpraSchema.HttpRequestBody,
  ) {
    target.description = metadata.description;
    target.required = metadata.required;
    target.maxContentSize = metadata.maxContentSize;
    target.immediateFetch = (metadata as HttpRequestBody.Metadata).immediateFetch;
    target.partial = metadata.partial;
    if (metadata.content) {
      await context.enterAsync('.content', async () => {
        for (let i = 0; i < metadata.content.length; i++) {
          await context.enterAsync(`[${i}]`, async () => {
            const src = metadata.content![i];
            const field = new HttpMediaType(target, String(i));
            await this._initHttpMediaType(context, field, src);
            target.content.push(field);
          });
        }
      });
    }
  }
}
