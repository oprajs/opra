import type { StrictOmit, Type } from 'ts-gems';
import { ResponsiveMap } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document';
import { ApiBase } from '../common/api-base.js';
import { MsgController } from './msg-controller.js';
import { MsgOperation } from './msg-operation.js';

export namespace MsgApi {
  export interface InitArguments extends ApiBase.InitArguments, StrictOmit<OpraSchema.MsgApi, 'controllers'> {}
}

/**
 * @class MsgApi
 */
export class MsgApi extends ApiBase {
  // noinspection JSUnusedGlobalSymbols
  protected _controllerReverseMap: WeakMap<Type, MsgController | null> = new WeakMap();
  declare readonly owner: ApiDocument;
  readonly transport = 'msg';
  platform: string;
  controllers: ResponsiveMap<MsgController> = new ResponsiveMap();

  constructor(init: MsgApi.InitArguments) {
    super(init);
    this.platform = init.platform;
  }

  findController(controller: Type): MsgController | undefined;
  findController(name: string): MsgController | undefined;
  findController(arg0: string | Type): MsgController | undefined {
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

  findOperation(controller: Type, operationName: string): MsgOperation | undefined;
  findOperation(controllerName: string, operationName: string): MsgOperation | undefined;
  findOperation(arg0: string | Type, operationName: string): MsgOperation | undefined {
    const controller = this.findController(arg0 as any);
    return controller?.operations.get(operationName);
  }

  toJSON(): OpraSchema.MsgApi {
    const schema = super.toJSON();
    const out: OpraSchema.MsgApi = {
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
