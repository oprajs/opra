import type { StrictOmit, Type } from 'ts-gems';
import { ResponsiveMap } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document';
import { ApiBase } from '../common/api-base.js';
import { RpcController } from './rpc-controller.js';
import { RpcOperation } from './rpc-operation.js';

export namespace RpcApi {
  export interface InitArguments extends ApiBase.InitArguments, StrictOmit<OpraSchema.RpcApi, 'controllers'> {}
}

/**
 * @class RpcApi
 */
export class RpcApi extends ApiBase {
  // noinspection JSUnusedGlobalSymbols
  protected _controllerReverseMap: WeakMap<Type, RpcController | null> = new WeakMap();
  declare readonly owner: ApiDocument;
  readonly transport = 'rpc';
  platform: string;
  controllers: ResponsiveMap<RpcController> = new ResponsiveMap();

  constructor(init: RpcApi.InitArguments) {
    super(init);
    this.platform = init.platform;
  }

  findController(controller: Type): RpcController | undefined;
  findController(name: string): RpcController | undefined;
  findController(arg0: string | Type): RpcController | undefined {
    if (typeof arg0 === 'function') {
      /** Check for cached mapping */
      const controller = this._controllerReverseMap.get(arg0);
      if (controller != null) return controller;
      /** Lookup for ctor in all controllers */
      for (const c of this.controllers.values()) {
        if (c.ctor === arg0) {
          this._controllerReverseMap.set(arg0, c);
          return c;
        }
      }
      this._controllerReverseMap.set(arg0, null);
      return;
    }
    return this.controllers.get(arg0);
  }

  findOperation(controller: Type, operationName: string): RpcOperation | undefined;
  findOperation(controllerName: string, operationName: string): RpcOperation | undefined;
  findOperation(arg0: string | Type, operationName: string): RpcOperation | undefined {
    const controller = this.findController(arg0 as any);
    return controller?.operations.get(operationName);
  }

  toJSON(): OpraSchema.RpcApi {
    const schema = super.toJSON();
    const out: OpraSchema.RpcApi = {
      ...schema,
      transport: this.transport,
      platform: this.platform,
      controllers: {},
    };
    for (const v of this.controllers.values()) {
      out.controllers[v.name] = v.toJSON();
    }
    return out;
  }
}
