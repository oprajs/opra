import type { Type } from 'ts-gems';
import { isConstructor, resolveThunk } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { DocumentInitContext } from '../common/document-init-context.js';
import { RPC_CONTROLLER_METADATA } from '../constants.js';
import { RpcApi } from '../rpc/rpc-api.js';
import { RpcController } from '../rpc/rpc-controller.js';
import { RpcHeader } from '../rpc/rpc-header.js';
import { RpcOperation } from '../rpc/rpc-operation.js';
import { RpcOperationResponse } from '../rpc/rpc-operation-response.js';
import { DataTypeFactory } from './data-type.factory.js';

export namespace RpcApiFactory {
  export interface InitArguments extends RpcApi.InitArguments {
    controllers: Type[] | any[] | ((parent: any) => any) | OpraSchema.RpcApi['controllers'];
  }
}

/**
 * @class RpcApiFactory
 */
export class RpcApiFactory {
  /**
   * Generates RpcApi
   * @param context
   * @param init
   */
  static async createApi(context: DocumentInitContext, init: RpcApiFactory.InitArguments): Promise<RpcApi> {
    const api = new RpcApi(init);
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
    parent: RpcApi,
    thunk: Type | object | Function | OpraSchema.RpcController,
    name?: string,
  ): Promise<RpcController | undefined | void> {
    if (typeof thunk === 'function' && !isConstructor(thunk)) {
      thunk = thunk();
    }
    thunk = await resolveThunk(thunk);
    let ctor: Type;
    let metadata: RpcController.Metadata | OpraSchema.RpcController;
    let instance: any;

    // If thunk is a class
    if (typeof thunk === 'function') {
      metadata = Reflect.getMetadata(RPC_CONTROLLER_METADATA, thunk);
      if (!metadata) return context.addError(`Class "${thunk.name}" doesn't have a valid RpcController metadata`);
      ctor = thunk as Type;
    } else {
      // If thunk is an instance of a class decorated with RpcController()
      ctor = Object.getPrototypeOf(thunk).constructor;
      metadata = Reflect.getMetadata(RPC_CONTROLLER_METADATA, ctor);
      if (metadata) instance = thunk;
      else {
        // If thunk is a DecoratorMetadata or InitArguments
        metadata = thunk as RpcController.Metadata;
        if ((thunk as any).instance === 'object') {
          instance = (thunk as any).instance;
          ctor = Object.getPrototypeOf(instance).constructor;
        }
      }
    }
    if (!metadata) return context.addError(`Class "${ctor.name}" is not decorated with RpcController()`);
    name = name || (metadata as any).name;
    if (!name) throw new TypeError(`Controller name required`);

    const controller = new RpcController(parent, {
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
            const prmArgs = { ...v } as RpcHeader.InitArguments;
            await context.enterAsync('.type', async () => {
              if (v.type) prmArgs.type = controller.node.findDataType(v.type);
              if (!prmArgs.type && typeof v.type === 'object') {
                prmArgs.type = await DataTypeFactory.createDataType(context, controller, v.type);
              }
              if (!prmArgs.type) prmArgs.type = controller.node.getDataType('any');
            });
            const prm = new RpcHeader(controller, prmArgs);
            controller.headers.push(prm);
          });
        }
      });
    }

    if (metadata.operations) {
      await context.enterAsync('.operations', async () => {
        for (const [operationName, operationMeta] of Object.entries<any>(metadata.operations!)) {
          await context.enterAsync(`[${operationName}]`, async () => {
            const operation = new RpcOperation(controller, {
              ...operationMeta,
              name: operationName,
              types: undefined,
              payloadType: undefined,
              keyType: undefined,
            });
            await this._initRpcOperation(context, operation, operationMeta);
            controller.operations.set(operation.name, operation);
          });
        }
      });
    }

    return controller;
  }

  /**
   * Initializes RpcOperation
   * @param context
   * @param operation
   * @param metadata
   * @protected
   */
  protected static async _initRpcOperation(
    context: DocumentInitContext,
    operation: RpcOperation,
    metadata: RpcOperation.Metadata | OpraSchema.RpcOperation,
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
            const prmArgs = { ...v } as RpcHeader.InitArguments;
            await context.enterAsync('.type', async () => {
              prmArgs.type = await DataTypeFactory.resolveDataType(context, operation, v.type);
            });
            const prm = new RpcHeader(operation, prmArgs);
            operation.headers.push(prm);
          });
        }
      });
    }

    if (metadata.response) {
      await context.enterAsync('.response', async () => {
        const response = new RpcOperationResponse(operation, {
          ...metadata.response!,
          payloadType: undefined,
          keyType: undefined,
        });
        await this._initRpcOperationResponse(context, response, metadata.response!);
        operation.response = response;
      });
    }
  }

  /**
   * Initializes RpcOperationResponse
   * @param context
   * @param response
   * @param metadata
   * @protected
   */
  protected static async _initRpcOperationResponse(
    context: DocumentInitContext,
    response: RpcOperationResponse,
    metadata: RpcOperationResponse.Metadata | OpraSchema.RpcOperationResponse,
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
            const prmArgs = { ...v } as RpcHeader.InitArguments;
            await context.enterAsync('.type', async () => {
              prmArgs.type = await DataTypeFactory.resolveDataType(context, response, v.type);
            });
            const prm = new RpcHeader(response, prmArgs);
            response.headers.push(prm);
          });
        }
      });
    }
  }
}
