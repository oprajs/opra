import { Type } from 'ts-gems';
import { ResponsiveMap } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document';
import { ApiBase } from '../common/api-base.js';
import { HttpController } from './http-controller.js';
import type { HttpOperation } from './http-operation.js';

/**
 * @class HttpApi
 */
export class HttpApi extends ApiBase {
  // noinspection JSUnusedGlobalSymbols
  protected _controllerReverseMap: WeakMap<Type, HttpController | null> = new WeakMap();
  readonly protocol = 'http';
  controllers: ResponsiveMap<HttpController> = new ResponsiveMap();
  url?: string;

  constructor(readonly owner: ApiDocument) {
    super(owner);
  }

  findController(controller: Type): HttpController | undefined;
  findController(resourcePath: string): HttpController | undefined;
  findController(arg0: string | Type): HttpController | undefined {
    return HttpController.prototype.findController.call(this, arg0 as any);
  }

  findOperation(controller: Type, operationName: string): HttpOperation | undefined;
  findOperation(resourcePath: string, operationName: string): HttpOperation | undefined;
  findOperation(arg0: string | Type, operationName: string): HttpOperation | undefined {
    const controller = this.findController(arg0 as any);
    return controller?.operations.get(operationName);
  }

  toJSON(): OpraSchema.HttpApi {
    const schema = super.toJSON();
    const out: OpraSchema.HttpApi = {
      ...schema,
      protocol: this.protocol,
      url: this.url,
      controllers: {},
    };
    for (const [name, v] of this.controllers.entries()) {
      out.controllers[name] = v.toJSON();
    }
    return out;
  }
}
