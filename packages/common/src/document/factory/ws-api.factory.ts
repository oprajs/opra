import { isConstructor } from '@jsopen/objects';
import type { Type } from 'ts-gems';
import { resolveThunk } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { DocumentInitContext } from '../common/document-init-context.js';
import { WS_CONTROLLER_METADATA, WS_PARAM_METADATA } from '../constants.js';
import { WSApi } from '../ws/ws-api.js';
import { WSController } from '../ws/ws-controller.js';
import { WSOperation } from '../ws/ws-operation.js';
import { DataTypeFactory } from './data-type.factory.js';

export namespace WSApiFactory {
  export interface InitArguments extends WSApi.InitArguments {
    controllers:
      | Type[]
      | any[]
      | ((parent: any) => any)
      | OpraSchema.WSApi['controllers'];
  }
}

/**
 * @class WSApiFactory
 */
export class WSApiFactory {
  /**
   * Generates MQApi
   * @param context
   * @param init
   */
  static async createApi(
    context: DocumentInitContext,
    init: WSApiFactory.InitArguments,
  ): Promise<WSApi> {
    const api = new WSApi(init);
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
    parent: WSApi,
    thunk: Type | object | Function | OpraSchema.WSController,
    name?: string,
  ): Promise<WSController | undefined | void> {
    if (typeof thunk === 'function' && !isConstructor(thunk)) {
      thunk = thunk();
    }
    thunk = await resolveThunk(thunk);
    let ctor: Type;
    let metadata: WSController.Metadata | OpraSchema.WSController;
    let instance: any;

    // If thunk is a class
    if (typeof thunk === 'function') {
      metadata = Reflect.getMetadata(WS_CONTROLLER_METADATA, thunk);
      if (!metadata)
        return context.addError(
          `Class "${thunk.name}" doesn't have a valid WSController metadata`,
        );
      ctor = thunk as Type;
    } else {
      // If thunk is an instance of a class decorated with WSController()
      ctor = Object.getPrototypeOf(thunk).constructor;
      metadata = Reflect.getMetadata(WS_CONTROLLER_METADATA, ctor);
      if (metadata) instance = thunk;
      else {
        // If thunk is a DecoratorMetadata or InitArguments
        metadata = thunk as WSController.Metadata;
        if ((thunk as any).instance === 'object') {
          instance = (thunk as any).instance;
          ctor = Object.getPrototypeOf(instance).constructor;
        }
      }
    }
    if (!metadata)
      return context.addError(
        `Class "${ctor.name}" is not decorated with WSController()`,
      );
    name = name || (metadata as any).name;
    if (!name) throw new TypeError(`Controller name required`);

    const controller = new WSController(parent, {
      ...metadata,
      name,
      instance,
      ctor,
    });
    if (metadata.types) {
      await context.enterAsync('.types', async () => {
        await DataTypeFactory.addDataTypes(
          context,
          controller,
          metadata.types!,
        );
      });
    }

    if (metadata.operations) {
      await context.enterAsync('.operations', async () => {
        for (const [operationName, _operationMeta] of Object.entries<any>(
          metadata.operations!,
        )) {
          await context.enterAsync(`[${operationName}]`, async () => {
            const argumentsMetadata = Reflect.getMetadata(
              WS_PARAM_METADATA,
              ctor.prototype,
              operationName,
            );
            let operationMeta = _operationMeta;
            if (argumentsMetadata) {
              operationMeta = {
                ...operationMeta,
                arguments: argumentsMetadata,
              };
            }

            const operation = new WSOperation(controller, {
              ...operationMeta,
              name: operationName,
              types: undefined,
              type: undefined,
              keyType: undefined,
              arguments: undefined,
              response: undefined,
            });
            await this._initWSOperation(context, operation, operationMeta);
            controller.operations.set(operationName, operation);
          });
        }
      });
    }

    return controller;
  }

  /**
   * Initializes WSOperation
   * @param context
   * @param operation
   * @param metadata
   * @protected
   */
  protected static async _initWSOperation(
    context: DocumentInitContext,
    operation: WSOperation,
    metadata: WSOperation.Metadata | OpraSchema.WSOperation,
  ): Promise<void> {
    if (metadata.types) {
      await context.enterAsync('.types', async () => {
        await DataTypeFactory.addDataTypes(context, operation, metadata.types!);
      });
    }
    if (metadata.arguments?.length) {
      await context.enterAsync('.arguments', async () => {
        operation.arguments = [];
        let x: any;
        for (x of metadata.arguments!) {
          const xx: any = {};
          if (typeof x === 'object' && x.type && x.parameterIndex !== null) {
            Object.assign(xx, x);
          } else xx.type = x;
          const t = await DataTypeFactory.resolveDataType(
            context,
            operation,
            xx.type,
          );
          operation.arguments?.push({
            type: t,
            parameterIndex: xx.parameterIndex,
          });
        }
      });
    }
    if (metadata.response) {
      await context.enterAsync('.response', async () => {
        operation.response = await DataTypeFactory.resolveDataType(
          context,
          operation,
          metadata.response!,
        );
      });
    }
  }
}
