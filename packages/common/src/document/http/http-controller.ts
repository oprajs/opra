import { asMutable, Combine, ThunkAsync, Type } from 'ts-gems';
import { omitUndefined, ResponsiveMap } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { DataTypeMap } from '../common/data-type-map.js';
import { DocumentElement } from '../common/document-element.js';
import { CLASS_NAME_PATTERN, DECORATOR, kDataTypeMap } from '../constants.js';
import type { EnumType } from '../data-type/enum-type.js';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../utils/inspect.util.js';
import { HttpControllerDecoratorFactory } from './decorators/http-controller.decorator.js';
import type { HttpApi } from './http-api.js';
import type { HttpOperation } from './http-operation';
import { HttpParameter } from './http-parameter.js';

/**
 * @namespace HttpController
 */
export namespace HttpController {
  export interface Metadata extends Pick<OpraSchema.HttpController, 'description' | 'path'> {
    name: string;
    controllers?: Type[];
    types?: ThunkAsync<Type | EnumType.EnumObject | EnumType.EnumArray>[];
    operations?: Record<string, HttpOperation.Metadata>;
    parameters?: HttpParameter.Metadata[];
  }

  export interface Options extends Partial<Pick<OpraSchema.HttpController, 'description' | 'path'>> {
    name?: string;
    controllers?: Type[];
  }

  export interface InitArguments
    extends Combine<
      {
        instance?: object;
        ctor?: Type;
      },
      Pick<Metadata, 'name' | 'description' | 'path'>
    > {}
}

/**
 * Type definition for HttpOperation
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
  _this.path = initArgs.path || initArgs.name;
  _this.instance = initArgs.instance;
  _this.ctor = initArgs.ctor;
  (_this as any)._initialize?.(initArgs);
} as HttpControllerStatic;

/**
 *
 * @class HttpController
 */
class HttpControllerClass extends DocumentElement {
  protected _controllerReverseMap: WeakMap<Type, HttpController | null> = new WeakMap();
  readonly kind: OpraSchema.HttpController.Kind;
  readonly name: string;
  description?: string;
  path: string;
  instance?: any;
  ctor?: Type;
  parameters: HttpParameter[];
  operations: ResponsiveMap<HttpOperation>;
  controllers: ResponsiveMap<HttpController>;
  types: DataTypeMap;

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
            this._controllerReverseMap.set(arg0, c);
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
    paramName = paramName.toLowerCase();
    for (const prm of this.parameters) {
      if (
        (!location || location === prm.location) &&
        ((prm.name instanceof RegExp && prm.name.test(paramName)) ||
          (typeof prm.name === 'string' && prm.name.toLowerCase() === paramName))
      )
        return prm;
    }
    if (this.node.parent && this.node.parent.element instanceof HttpController)
      return this.node.parent.element.findParameter(paramName, location);
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
      for (const [name, v] of this.operations.entries()) {
        out.operations[name] = v.toJSON();
      }
    }
    if (this.controllers.size) {
      out.controllers = {};
      for (const [name, v] of this.controllers.entries()) {
        out.controllers[name] = v.toJSON();
      }
    }
    if (this.types.size) {
      out.types = {};
      for (const [name, v] of this.types.entries()) {
        out.types[name] = v.toJSON();
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
