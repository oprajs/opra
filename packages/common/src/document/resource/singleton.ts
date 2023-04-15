import omit from 'lodash.omit';
import { StrictOmit, Type, Writable } from 'ts-gems';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { TypeThunkAsync } from '../../types.js';
import type { ApiDocument } from '../api-document.js';
import { METADATA_KEY } from '../constants.js';
import { ComplexType } from '../data-type/complex-type.js';
import { Resource } from './resource.js';

const NESTJS_INJECTABLE_WATERMARK = '__injectable__';
const NAME_PATTERN = /^(.*)(Resource|Singleton)$/;

export namespace Singleton {
  export interface InitArguments extends Resource.InitArguments,
      Pick<OpraSchema.Singleton, 'operations'> {
    type: ComplexType;
  }

  export interface DecoratorOptions extends Resource.DecoratorOptions {

  }

  export interface Metadata extends StrictOmit<OpraSchema.Singleton, 'type'> {
    name: string;
    type: TypeThunkAsync | string;
  }

  interface Operation {
    handlerName?: string;
  }

  export interface Operations {
    create?: OpraSchema.Singleton.CreateOperation & Operation;
    delete?: OpraSchema.Singleton.DeleteOperation & Operation;
    get?: OpraSchema.Singleton.GetOperation & Operation;
    update?: OpraSchema.Singleton.UpdateOperation & Operation;
  }

  export type CreateOperationOptions = Required<Operations>['create'];
  export type DeleteOperationOptions = Required<Operations>['delete'];
  export type UpdateOperationOptions = Required<Operations>['update'];
  export type GetOperationOptions = Required<Operations>['get'];
}

export interface Singleton extends StrictOmit<Resource, 'exportSchema' | '_construct'> {
  readonly type: ComplexType;
  readonly operations: Singleton.Operations;
  readonly controller?: object | Type;

  exportSchema(): OpraSchema.Singleton;

  normalizeElementNames(elements: string[]): string[] | undefined;

  _construct(init: Singleton.InitArguments): void;
}

export interface SingletonConstructor {
  prototype: Singleton;

  new(document: ApiDocument, init: Singleton.InitArguments): Singleton;

  (type: TypeThunkAsync | string, options?: Singleton.DecoratorOptions): ClassDecorator;

  CreateOperation: (options?: Singleton.CreateOperationOptions) => PropertyDecorator;
  GetOperation: (options?: Singleton.GetOperationOptions) => PropertyDecorator;
  DeleteOperation: (options?: Singleton.DeleteOperationOptions) => PropertyDecorator;
  UpdateOperation: (options?: Singleton.UpdateOperationOptions) => PropertyDecorator;
}

export const Singleton = function (this: Singleton | void, ...args: any[]) {

  // ClassDecorator
  if (!this) {
    const [type, options] = args as [TypeThunkAsync | string, Singleton.DecoratorOptions | undefined];
    return function (target: Function) {
      const name = options?.name || target.name.match(NAME_PATTERN)?.[1] || target.name;
      const metadata: Singleton.Metadata = Reflect.getOwnMetadata(METADATA_KEY, target) || ({} as any);
      metadata.kind = OpraSchema.Singleton.Kind;
      metadata.name = name;
      metadata.type = type;
      // Merge with previous metadata object
      const m = Reflect.getMetadata(METADATA_KEY, target);
      if (m && metadata !== m)
        Object.assign(metadata, omit(m), Object.keys(metadata));
      // Merge options
      if (options)
        Object.assign(metadata, omit(options, ['kind', 'name', 'type', 'controller']));
      Reflect.defineMetadata(METADATA_KEY, metadata, target);

      /* Define Injectable metadata for NestJS support*/
      Reflect.defineMetadata(NESTJS_INJECTABLE_WATERMARK, true, target);
    }
  }

  // Constructor
  const [document, init] = args as [ApiDocument, Singleton.InitArguments];

  // call super()
  Resource.apply(this, [document, init]);
} as SingletonConstructor;

const proto = {
  _construct(init: Singleton.InitArguments): void {
    // call super()
    Resource.prototype._construct.call(this, init);

    const _this = this as Writable<Singleton>;
    _this.kind = OpraSchema.Singleton.Kind;
    _this.controller = init.controller;
    const operations = _this.operations = init.operations || {};
    _this.type = init.type;
    if (_this.controller) {
      const instance = typeof _this.controller == 'function'
          ? new (_this.controller as Type)()
          : _this.controller;
      for (const operation of Object.values(operations)) {
        if (!operation.handler && operation.handlerName) {
          const fn = instance[operation.handlerName];
          if (!fn)
            throw new TypeError(`No such operation handler (${operation.handlerName}) found`);
          operation.handler = fn.bind(instance);
        }
      }
    }
  },

  exportSchema(): OpraSchema.Singleton {
    const out = Resource.prototype.exportSchema.call(this) as OpraSchema.Singleton;
    Object.assign(out, omitUndefined({
      type: this.type.name,
      operations: this.operations
    }));
    return out;
  },

  normalizeElementNames(this: Singleton, elements: string[]): string[] | undefined {
    return this.type.normalizeElementNames(elements);
  },

} as Singleton;

Object.assign(Singleton.prototype, proto);
Object.setPrototypeOf(Singleton.prototype, Resource.prototype);


function createOperationDecorator<T>(operation: string) {
  return (options?: T) =>
      ((target: Object, propertyKey: string | symbol): void => {
        const metadata = {
          ...options,
          handlerName: propertyKey
        } as OpraSchema.Singleton.CreateOperation;

        const resourceMetadata = (Reflect.getOwnMetadata(METADATA_KEY, target.constructor) || {}) as Singleton.Metadata;
        resourceMetadata.operations = resourceMetadata.operations || {};
        resourceMetadata.operations[operation] = metadata;
        Reflect.defineMetadata(METADATA_KEY, resourceMetadata, target.constructor);
      });
}


Singleton.CreateOperation = createOperationDecorator('create');
Singleton.GetOperation = createOperationDecorator('get');
Singleton.DeleteOperation = createOperationDecorator('delete');
Singleton.UpdateOperation = createOperationDecorator('update');
