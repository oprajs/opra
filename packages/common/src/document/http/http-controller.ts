import nodePath from 'node:path';
import type { Combine, ThunkAsync, Type } from 'ts-gems';
import { asMutable } from 'ts-gems';
import { omitUndefined, ResponsiveMap } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { DataTypeMap } from '../common/data-type-map.js';
import { DocumentElement } from '../common/document-element.js';
import { CLASS_NAME_PATTERN, DECORATOR, HTTP_CONTROLLER_METADATA, kDataTypeMap } from '../constants.js';
import type { EnumType } from '../data-type/enum-type.js';
import { HttpControllerDecoratorFactory } from '../decorators/http-controller.decorator.js';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../utils/inspect.util.js';
import type { HttpApi } from './http-api.js';
import type { HttpOperation } from './http-operation';
import { HttpParameter } from './http-parameter.js';

/**
 * @namespace HttpController
 */
export namespace HttpController {
  export interface Metadata extends Pick<OpraSchema.HttpController, 'description' | 'path'> {
    name: string;
    controllers?: (Type | ((parent: any) => any))[];
    types?: ThunkAsync<Type | EnumType.EnumObject | EnumType.EnumArray>[];
    operations?: Record<string, HttpOperation.Metadata>;
    parameters?: HttpParameter.Metadata[];
    onInit?: (resource: HttpController) => void;
    onShutdown?: (resource: HttpController) => void | Promise<void>;
  }

  export interface Options extends Partial<Pick<OpraSchema.HttpController, 'description' | 'path'>> {
    name?: string;
    controllers?: (Type | ((parent: any) => any))[];
  }

  export interface InitArguments
    extends Combine<
      {
        instance?: object;
        ctor?: Type;
      },
      Pick<Metadata, 'name' | 'description' | 'path' | 'onInit' | 'onShutdown'>
    > {}
}

/**
 * Type definition for HttpController
 * @class HttpController
 */
export interface HttpControllerStatic extends HttpControllerDecoratorFactory {
  /**
   * Class constructor of HttpController
   * @param owner
   * @param args
   */
  new (owner: HttpApi | HttpController, args: HttpController.InitArguments): HttpController;

  prototype: HttpController;

  OnInit(): PropertyDecorator;

  OnShutdown(): PropertyDecorator;
}

/**
 * Type definition of HttpController prototype
 * @interface HttpController
 */
export interface HttpController extends HttpControllerClass {}

/**
 * HttpController
 */
export const HttpController = function (this: HttpController | void, ...args: any[]) {
  // ClassDecorator
  if (!this) return HttpController[DECORATOR].apply(undefined, args);

  // Constructor
  const [owner, initArgs] = args as [HttpApi | HttpController, HttpController.InitArguments];
  DocumentElement.call(this, owner);
  if (!CLASS_NAME_PATTERN.test(initArgs.name)) throw new TypeError(`Invalid resource name (${initArgs.name})`);
  const _this = asMutable(this);
  _this.kind = OpraSchema.HttpController.Kind;
  _this.types = _this.node[kDataTypeMap] = new DataTypeMap();
  _this.operations = new ResponsiveMap();
  _this.controllers = new ResponsiveMap();
  _this.parameters = [];
  _this.name = initArgs.name;
  _this.description = initArgs.description;
  _this.path = initArgs.path ?? initArgs.name;
  _this.instance = initArgs.instance;
  _this.ctor = initArgs.ctor;
  (_this as any)._controllerReverseMap = new WeakMap();
  (_this as any)._initialize?.(initArgs);
  _this.onInit = initArgs.onInit;
  _this.onShutdown = initArgs.onShutdown;
} as HttpControllerStatic;

/**
 *
 * @class HttpController
 */
class HttpControllerClass extends DocumentElement {
  protected declare _controllerReverseMap: WeakMap<Type, HttpController | null>;
  declare readonly kind: OpraSchema.HttpController.Kind;
  declare readonly name: string;
  declare description?: string;
  declare path: string;
  declare instance?: any;
  declare ctor?: Type;
  declare parameters: HttpParameter[];
  declare operations: ResponsiveMap<HttpOperation>;
  declare controllers: ResponsiveMap<HttpController>;
  declare types: DataTypeMap;
  declare onInit?: (resource: HttpController) => void;
  declare onShutdown?: (resource: HttpController) => void | Promise<void>;

  /**
   * @property isRoot
   */
  get isRoot(): boolean {
    return !(this.owner instanceof HttpController);
  }

  findController(controller: Type): HttpController | undefined;
  findController(resourcePath: string): HttpController | undefined;
  findController(arg0: string | Type): HttpController | undefined {
    if (typeof arg0 === 'function') {
      /** Check for cached mapping */
      let controller = this._controllerReverseMap.get(arg0);
      if (controller != null) return controller;
      /** Lookup for ctor in all controllers */
      for (const c of this.controllers.values()) {
        if (c.ctor === arg0) {
          this._controllerReverseMap.set(arg0, c);
          return c;
        }
        if (c.controllers.size) {
          controller = c.findController(arg0);
          if (controller) {
            this._controllerReverseMap.set(arg0, controller);
            return controller;
          }
        }
      }
      this._controllerReverseMap.set(arg0, null);
      return;
    }
    if (arg0.startsWith('/')) arg0 = arg0.substring(1);
    if (arg0.includes('/')) {
      const a = arg0.split('/');
      let r: HttpController | undefined = this;
      while (r && a.length > 0) {
        r = r.controllers.get(a.shift()!);
      }
      return r;
    }
    return this.controllers.get(arg0);
  }

  findParameter(paramName: string, location?: OpraSchema.HttpParameterLocation): HttpParameter | undefined {
    const paramNameLower = paramName.toLowerCase();
    let prm: any;
    for (prm of this.parameters) {
      if (location && location !== prm.location) continue;
      if (typeof prm.name === 'string') {
        prm._nameLower = prm._nameLower || prm.name.toLowerCase();
        if (prm._nameLower === paramNameLower) return prm;
      }
      if (prm.name instanceof RegExp && prm.name.test(paramName)) return prm;
    }
    if (this.node.parent && this.node.parent.element instanceof HttpController) {
      return this.node.parent.element.findParameter(paramName, location);
    }
  }

  getFullUrl(): string {
    return nodePath.posix.join(this.owner instanceof HttpController ? this.owner.getFullUrl() : '/', this.path);
  }

  /**
   *
   */
  toString(): string {
    return `[HttpController ${this.name}]`;
  }

  /**
   *
   */
  toJSON(): OpraSchema.HttpController {
    const out = omitUndefined<OpraSchema.HttpController>({
      kind: this.kind,
      description: this.description,
      path: this.path,
    });
    if (this.operations.size) {
      out.operations = {};
      for (const v of this.operations.values()) {
        out.operations[v.name] = v.toJSON();
      }
    }
    if (this.controllers.size) {
      out.controllers = {};
      for (const v of this.controllers.values()) {
        out.controllers[v.name] = v.toJSON();
      }
    }
    if (this.types.size) {
      out.types = {};
      for (const v of this.types.values()) {
        out.types[v.name!] = v.toJSON();
      }
    }
    if (this.parameters.length) {
      out.parameters = [];
      for (const prm of this.parameters) {
        out.parameters.push(prm.toJSON());
      }
    }
    return out;
  }

  /**
   *
   */
  protected [nodeInspectCustom](): string {
    return `[${colorFgYellow}HttpController${colorFgMagenta + this.name + colorReset}]`;
  }
}

HttpController.prototype = HttpControllerClass.prototype;
Object.assign(HttpController, HttpControllerDecoratorFactory);
HttpController[DECORATOR] = HttpControllerDecoratorFactory;

HttpController.OnInit = function () {
  return (target: Object, propertyKey: string | symbol) => {
    const sourceMetadata = (Reflect.getOwnMetadata(HTTP_CONTROLLER_METADATA, target.constructor) || {}) as any;
    sourceMetadata.onInit = target[propertyKey];
    Reflect.defineMetadata(HTTP_CONTROLLER_METADATA, target.constructor, sourceMetadata);
  };
};

HttpController.OnShutdown = function () {
  return (target: Object, propertyKey: string | symbol) => {
    const sourceMetadata = (Reflect.getOwnMetadata(HTTP_CONTROLLER_METADATA, target.constructor) || {}) as any;
    sourceMetadata.onShutdown = target[propertyKey];
    Reflect.defineMetadata(HTTP_CONTROLLER_METADATA, target.constructor, sourceMetadata);
  };
};
