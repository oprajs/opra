import type { Combine, ThunkAsync, Type } from 'ts-gems';
import { asMutable } from 'ts-gems';
import { omitUndefined, ResponsiveMap } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { DataTypeMap } from '../common/data-type-map.js';
import { DocumentElement } from '../common/document-element.js';
import { CLASS_NAME_PATTERN, DECORATOR, kDataTypeMap, MSG_CONTROLLER_METADATA } from '../constants.js';
import type { EnumType } from '../data-type/enum-type.js';
import { MsgControllerDecoratorFactory } from '../decorators/msg-controller.decorator.js';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../utils/inspect.util.js';
import type { MsgApi } from './msg-api.js';
import type { MsgHeader } from './msg-header.js';
import type { MsgOperation } from './msg-operation.js';

/**
 * @namespace MsgController
 */
export namespace MsgController {
  export interface Metadata extends Pick<OpraSchema.MsgController, 'description'> {
    name: string;
    types?: ThunkAsync<Type | EnumType.EnumObject | EnumType.EnumArray>[];
    operations?: Record<string, MsgOperation.Metadata>;
    headers?: MsgHeader.Metadata[];
    onInit?: (resource: MsgController) => void;
    onShutdown?: (resource: MsgController) => void | Promise<void>;
  }

  export interface Options extends Partial<Pick<OpraSchema.MsgController, 'description'>> {
    name?: string;
  }

  export interface InitArguments
    extends Combine<
      {
        instance?: object;
        ctor?: Type;
      },
      Pick<Metadata, 'name' | 'description' | 'onInit' | 'onShutdown'>
    > {}
}

/**
 * Type definition for MsgController
 * @class MsgController
 */
export interface MsgControllerStatic extends MsgControllerDecoratorFactory {
  /**
   * Class constructor of MsgController
   * @param owner
   * @param args
   */
  new (owner: MsgApi | MsgController, args: MsgController.InitArguments): MsgController;

  prototype: MsgController;

  OnInit(): PropertyDecorator;

  OnShutdown(): PropertyDecorator;
}

/**
 * Type definition of MsgController prototype
 * @interface MsgController
 */
export interface MsgController extends MsgControllerClass {}

/**
 * MsgController
 */
export const MsgController = function (this: MsgController | void, ...args: any[]) {
  // ClassDecorator
  if (!this) return MsgController[DECORATOR].apply(undefined, args);

  // Constructor
  const [owner, initArgs] = args as [MsgApi | MsgController, MsgController.InitArguments];
  DocumentElement.call(this, owner);
  if (!CLASS_NAME_PATTERN.test(initArgs.name)) throw new TypeError(`Invalid resource name (${initArgs.name})`);
  const _this = asMutable(this);
  _this.kind = OpraSchema.MsgController.Kind;
  _this.types = _this.node[kDataTypeMap] = new DataTypeMap();
  _this.operations = new ResponsiveMap();
  _this.headers = [];
  _this.name = initArgs.name;
  _this.description = initArgs.description;
  _this.instance = initArgs.instance;
  _this.ctor = initArgs.ctor;
  (_this as any)._controllerReverseMap = new WeakMap();
  (_this as any)._initialize?.(initArgs);
  _this.onInit = initArgs.onInit;
  _this.onShutdown = initArgs.onShutdown;
} as MsgControllerStatic;

/**
 *
 * @class MsgController
 */
class MsgControllerClass extends DocumentElement {
  protected declare _controllerReverseMap: WeakMap<Type, MsgController | null>;
  declare readonly kind: OpraSchema.MsgController.Kind;
  declare readonly name: string;
  declare description?: string;
  declare path: string;
  declare instance?: any;
  declare ctor?: Type;
  declare headers: MsgHeader[];
  declare operations: ResponsiveMap<MsgOperation>;
  declare types: DataTypeMap;
  declare onInit?: (resource: MsgController) => void;
  declare onShutdown?: (resource: MsgController) => void | Promise<void>;

  findHeader(paramName: string, location?: OpraSchema.HttpParameterLocation): MsgHeader | undefined {
    const paramNameLower = paramName.toLowerCase();
    let prm: any;
    for (prm of this.headers) {
      if (typeof prm.name === 'string') {
        prm._nameLower = prm._nameLower || prm.name.toLowerCase();
        if (prm._nameLower === paramNameLower) return prm;
      }
      if (prm.name instanceof RegExp && prm.name.test(paramName)) return prm;
    }
    if (this.node.parent && this.node.parent.element instanceof MsgController) {
      return this.node.parent.element.findHeader(paramName, location);
    }
  }

  /**
   *
   */
  toString(): string {
    return `[MsgController ${this.name}]`;
  }

  /**
   *
   */
  toJSON(): OpraSchema.MsgController {
    const out = omitUndefined<OpraSchema.MsgController>({
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
    return `[${colorFgYellow}MsgController${colorFgMagenta + this.name + colorReset}]`;
  }
}

MsgController.prototype = MsgControllerClass.prototype;
Object.assign(MsgController, MsgControllerDecoratorFactory);
MsgController[DECORATOR] = MsgControllerDecoratorFactory;

MsgController.OnInit = function () {
  return (target: Object, propertyKey: string | symbol) => {
    const sourceMetadata = (Reflect.getOwnMetadata(MSG_CONTROLLER_METADATA, target.constructor) || {}) as any;
    sourceMetadata.onInit = target[propertyKey];
    Reflect.defineMetadata(MSG_CONTROLLER_METADATA, target.constructor, sourceMetadata);
  };
};

MsgController.OnShutdown = function () {
  return (target: Object, propertyKey: string | symbol) => {
    const sourceMetadata = (Reflect.getOwnMetadata(MSG_CONTROLLER_METADATA, target.constructor) || {}) as any;
    sourceMetadata.onShutdown = target[propertyKey];
    Reflect.defineMetadata(MSG_CONTROLLER_METADATA, target.constructor, sourceMetadata);
  };
};
