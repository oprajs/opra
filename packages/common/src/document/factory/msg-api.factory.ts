import type { Type } from 'ts-gems';
import { isConstructor, resolveThunk } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { DocumentInitContext } from '../common/document-init-context.js';
import { MSG_CONTROLLER_METADATA } from '../constants.js';
import { MsgApi } from '../msg/msg-api.js';
import { MsgController } from '../msg/msg-controller.js';
import { MsgHeader } from '../msg/msg-header.js';
import { MsgOperation } from '../msg/msg-operation.js';
import { MsgOperationResponse } from '../msg/msg-operation-response.js';
import { DataTypeFactory } from './data-type.factory.js';

export namespace MsgApiFactory {
  export interface InitArguments extends MsgApi.InitArguments {
    controllers: Type[] | any[] | ((parent: any) => any) | OpraSchema.MsgApi['controllers'];
  }
}

/**
 * @class MsgApiFactory
 */
export class MsgApiFactory {
  /**
   * Generates MsgApi
   * @param context
   * @param init
   */
  static async createApi(context: DocumentInitContext, init: MsgApiFactory.InitArguments): Promise<MsgApi> {
    const api = new MsgApi(init);
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
    parent: MsgApi,
    thunk: Type | object | Function | OpraSchema.MsgController,
    name?: string,
  ): Promise<MsgController | undefined | void> {
    if (typeof thunk === 'function' && !isConstructor(thunk)) {
      thunk = thunk();
    }
    thunk = await resolveThunk(thunk);
    let ctor: Type;
    let metadata: MsgController.Metadata | OpraSchema.MsgController;
    let instance: any;

    // If thunk is a class
    if (typeof thunk === 'function') {
      metadata = Reflect.getMetadata(MSG_CONTROLLER_METADATA, thunk);
      if (!metadata) return context.addError(`Class "${thunk.name}" doesn't have a valid MsgController metadata`);
      ctor = thunk as Type;
    } else {
      // If thunk is an instance of a class decorated with MsgController()
      ctor = Object.getPrototypeOf(thunk).constructor;
      metadata = Reflect.getMetadata(MSG_CONTROLLER_METADATA, ctor);
      if (metadata) instance = thunk;
      else {
        // If thunk is a DecoratorMetadata or InitArguments
        metadata = thunk as MsgController.Metadata;
        if ((thunk as any).instance === 'object') {
          instance = (thunk as any).instance;
          ctor = Object.getPrototypeOf(instance).constructor;
        }
      }
    }
    if (!metadata) return context.addError(`Class "${ctor.name}" is not decorated with MsgController()`);
    name = name || (metadata as any).name;
    if (!name) throw new TypeError(`Controller name required`);

    const controller = new MsgController(parent, {
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

    if (metadata.headers) {
      await context.enterAsync('.headers', async () => {
        let i = 0;
        for (const v of metadata.headers!) {
          await context.enterAsync(`[${i++}]`, async () => {
            const prmArgs = { ...v } as MsgHeader.InitArguments;
            await context.enterAsync('.type', async () => {
              if (v.type) prmArgs.type = controller.node.findDataType(v.type);
              if (!prmArgs.type && typeof v.type === 'object') {
                prmArgs.type = await DataTypeFactory.createDataType(context, controller, v.type);
              }
              if (!prmArgs.type) prmArgs.type = controller.node.getDataType('any');
            });
            const prm = new MsgHeader(controller, prmArgs);
            controller.headers.push(prm);
          });
        }
      });
    }

    if (metadata.operations) {
      await context.enterAsync('.operations', async () => {
        for (const [operationName, operationMeta] of Object.entries<any>(metadata.operations!)) {
          await context.enterAsync(`[${operationName}]`, async () => {
            const operation = new MsgOperation(controller, {
              ...operationMeta,
              name: operationName,
              types: undefined,
              payloadType: undefined,
              keyType: undefined,
            });
            await this._initMsgOperation(context, operation, operationMeta);
            controller.operations.set(operation.name, operation);
          });
        }
      });
    }

    return controller;
  }

  /**
   * Initializes MsgOperation
   * @param context
   * @param operation
   * @param metadata
   * @protected
   */
  protected static async _initMsgOperation(
    context: DocumentInitContext,
    operation: MsgOperation,
    metadata: MsgOperation.Metadata | OpraSchema.MsgOperation,
  ): Promise<void> {
    if (metadata.types) {
      await context.enterAsync('.types', async () => {
        await DataTypeFactory.addDataTypes(context, operation, metadata.types!);
      });
    }

    (operation as any).payloadType = await DataTypeFactory.resolveDataType(context, operation, metadata.payloadType);
    if (metadata.keyType) {
      (operation as any).keyType = await DataTypeFactory.resolveDataType(context, operation, metadata.keyType);
    }

    if (metadata.headers) {
      await context.enterAsync('.headers', async () => {
        let i = 0;
        for (const v of metadata.headers!) {
          await context.enterAsync(`[${i++}]`, async () => {
            const prmArgs = { ...v } as MsgHeader.InitArguments;
            await context.enterAsync('.type', async () => {
              prmArgs.type = await DataTypeFactory.resolveDataType(context, operation, v.type);
            });
            const prm = new MsgHeader(operation, prmArgs);
            operation.headers.push(prm);
          });
        }
      });
    }

    if (metadata.response) {
      await context.enterAsync('.response', async () => {
        const response = new MsgOperationResponse(operation, {
          ...metadata.response!,
          payloadType: undefined,
          keyType: undefined,
        });
        await this._initMsgOperationResponse(context, response, metadata.response!);
        operation.response = response;
      });
    }
  }

  /**
   * Initializes MsgOperationResponse
   * @param context
   * @param response
   * @param metadata
   * @protected
   */
  protected static async _initMsgOperationResponse(
    context: DocumentInitContext,
    response: MsgOperationResponse,
    metadata: MsgOperationResponse.Metadata | OpraSchema.MsgOperationResponse,
  ): Promise<void> {
    (response as any).payloadType = await DataTypeFactory.resolveDataType(context, response, metadata.payloadType);
    if (metadata.keyType) {
      (response as any).keyType = await DataTypeFactory.resolveDataType(context, response, metadata.keyType);
    }

    if (metadata.headers) {
      await context.enterAsync('.headers', async () => {
        let i = 0;
        for (const v of metadata.headers!) {
          await context.enterAsync(`[${i++}]`, async () => {
            const prmArgs = { ...v } as MsgHeader.InitArguments;
            await context.enterAsync('.type', async () => {
              prmArgs.type = await DataTypeFactory.resolveDataType(context, response, v.type);
            });
            const prm = new MsgHeader(response, prmArgs);
            response.headers.push(prm);
          });
        }
      });
    }
  }
}
