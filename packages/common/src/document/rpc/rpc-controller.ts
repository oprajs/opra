import { omitUndefined } from '@jsopen/objects';
import type { Combine, ThunkAsync, Type } from 'ts-gems';
import { asMutable } from 'ts-gems';
import { ResponsiveMap } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { DataTypeMap } from '../common/data-type-map.js';
import { DocumentElement } from '../common/document-element.js';
import { CLASS_NAME_PATTERN, DECORATOR, kDataTypeMap } from '../constants.js';
import type { EnumType } from '../data-type/enum-type.js';
import { RpcControllerDecoratorFactory } from '../decorators/rpc-controller.decorator.js';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../utils/inspect.util.js';
import type { RpcApi } from './rpc-api';
import type { RpcHeader } from './rpc-header.js';
import type { RpcOperation } from './rpc-operation';

/**
 * @namespace RpcController
 */
export namespace RpcController {
  export interface Metadata extends Pick<OpraSchema.RpcController, 'description'> {
    name: string;
    types?: ThunkAsync<Type | EnumType.EnumObject | EnumType.EnumArray>[];
    operations?: Record<string, RpcOperation.Metadata>;
    headers?: RpcHeader.Metadata[];
  }

  export interface Options extends Partial<Pick<OpraSchema.RpcController, 'description'>> {
    name?: string;
  }

  export interface InitArguments
    extends Combine<
      {
        instance?: object;
        ctor?: Type;
      },
      Pick<Metadata, 'name' | 'description'>
    > {}
}

/**
 * Type definition for RpcController
 * @class RpcController
 */
export interface RpcControllerStatic extends RpcControllerDecoratorFactory {
  /**
   * Class constructor of RpcController
   * @param owner
   * @param args
   */
  new (owner: RpcApi | RpcController, args: RpcController.InitArguments): RpcController;

  prototype: RpcController;
}

/**
 * Type definition of RpcController prototype
 * @interface RpcController
 */
export interface RpcController extends RpcControllerClass {}

/**
 * RpcController
 */
export const RpcController = function (this: RpcController | void, ...args: any[]) {
  // ClassDecorator
  if (!this) return RpcController[DECORATOR].apply(undefined, args);

  // Constructor
  const [owner, initArgs] = args as [RpcApi | RpcController, RpcController.InitArguments];
  DocumentElement.call(this, owner);
  if (!CLASS_NAME_PATTERN.test(initArgs.name)) throw new TypeError(`Invalid resource name (${initArgs.name})`);
  const _this = asMutable(this);
  _this.kind = OpraSchema.RpcController.Kind;
  _this.types = _this.node[kDataTypeMap] = new DataTypeMap();
  _this.operations = new ResponsiveMap();
  _this.headers = [];
  _this.name = initArgs.name;
  _this.description = initArgs.description;
  _this.instance = initArgs.instance;
  _this.ctor = initArgs.ctor;
  (_this as any)._controllerReverseMap = new WeakMap();
  (_this as any)._initialize?.(initArgs);
} as RpcControllerStatic;

/**
 *
 * @class RpcController
 */
class RpcControllerClass extends DocumentElement {
  declare protected _controllerReverseMap: WeakMap<Type, RpcController | null>;
  declare readonly kind: OpraSchema.RpcController.Kind;
  declare readonly name: string;
  declare description?: string;
  declare path: string;
  declare instance?: any;
  declare ctor?: Type;
  declare headers: RpcHeader[];
  declare operations: ResponsiveMap<RpcOperation>;
  declare types: DataTypeMap;

  findHeader(paramName: string, location?: OpraSchema.HttpParameterLocation): RpcHeader | undefined {
    const paramNameLower = paramName.toLowerCase();
    let prm: any;
    for (prm of this.headers) {
      if (typeof prm.name === 'string') {
        prm._nameLower = prm._nameLower || prm.name.toLowerCase();
        if (prm._nameLower === paramNameLower) return prm;
      }
      if (prm.name instanceof RegExp && prm.name.test(paramName)) return prm;
    }
    if (this.node.parent && this.node.parent.element instanceof RpcController) {
      return this.node.parent.element.findHeader(paramName, location);
    }
  }

  /**
   *
   */
  toString(): string {
    return `[RpcController ${this.name}]`;
  }

  /**
   *
   */
  toJSON(): OpraSchema.RpcController {
    const out = omitUndefined<OpraSchema.RpcController>({
      kind: this.kind,
      description: this.description,
    });
    if (this.operations.size) {
      out.operations = {};
      for (const v of this.operations.values()) {
        out.operations[v.name] = v.toJSON();
      }
    }
    if (this.types.size) {
      out.types = {};
      for (const v of this.types.values()) {
        out.types[v.name!] = v.toJSON();
      }
    }
    if (this.headers.length) {
      out.headers = [];
      for (const prm of this.headers) {
        out.headers.push(prm.toJSON());
      }
    }
    return out;
  }

  /**
   *
   */
  protected [nodeInspectCustom](): string {
    return `[${colorFgYellow}RpcController${colorFgMagenta + this.name + colorReset}]`;
  }
}

RpcController.prototype = RpcControllerClass.prototype;
Object.assign(RpcController, RpcControllerDecoratorFactory);
RpcController[DECORATOR] = RpcControllerDecoratorFactory;
