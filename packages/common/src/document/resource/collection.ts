import omit from 'lodash.omit';
import merge from 'putil-merge';
import { StrictOmit, Type, Writable } from 'ts-gems';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { TypeThunkAsync } from '../../types.js';
import type { ApiDocument } from '../api-document.js';
import { METADATA_KEY } from '../constants.js';
import type { ComplexType } from '../data-type/complex-type.js';
import { Resource } from './resource.js';

const NESTJS_INJECTABLE_WATERMARK = '__injectable__';
const NAME_PATTERN = /^(.*)(Resource|Collection)$/;

export namespace Collection {
  export interface InitArguments extends Resource.InitArguments,
      Pick<OpraSchema.Collection, 'primaryKey'> {
    type: ComplexType;
    operations: Operations;
  }

  export interface DecoratorOptions extends Resource.DecoratorOptions,
      Partial<Pick<OpraSchema.Collection, 'primaryKey'>> {
  }

  export interface Metadata extends StrictOmit<OpraSchema.Collection, 'type'> {
    name: string;
    type: TypeThunkAsync | string;
  }

  interface Operation {
    handlerName?: string;
  }

  export interface Operations {
    create?: OpraSchema.Collection.CreateOperation & Operation;
    delete?: OpraSchema.Collection.DeleteOperation & Operation;
    deleteMany?: OpraSchema.Collection.DeleteManyOperation & Operation;
    get?: OpraSchema.Collection.GetOperation & Operation;
    update?: OpraSchema.Collection.UpdateOperation & Operation;
    updateMany?: OpraSchema.Collection.UpdateManyOperation & Operation;
    search?: OpraSchema.Collection.SearchOperation & Operation;
  }

  export type CreateOperationOptions = Required<Operations>['create'];
  export type DeleteOperationOptions = Required<Operations>['delete'];
  export type DeleteManyOperationOptions = Required<Operations>['deleteMany'];
  export type UpdateOperationOptions = Required<Operations>['update'];
  export type GetOperationOptions = Required<Operations>['get'];
  export type UpdateManyOperationOptions = Required<Operations>['updateMany'];
  export type SearchOperationOptions = Required<Operations>['search'];
}

export interface Collection extends StrictOmit<Resource, 'exportSchema' | '_construct'> {
  readonly type: ComplexType;
  readonly operations: Collection.Operations;
  readonly controller?: object;
  readonly primaryKey: string[];

  exportSchema(): OpraSchema.Collection;

  _construct(init: Collection.InitArguments): void;
}

export interface CollectionConstructor {
  prototype: Collection;

  new(document: ApiDocument, init: Collection.InitArguments): Collection;

  (type: TypeThunkAsync | string, options?: Collection.DecoratorOptions): ClassDecorator;

  CreateOperation: (options?: Collection.CreateOperationOptions) => PropertyDecorator;
  GetOperation: (options?: Collection.GetOperationOptions) => PropertyDecorator;
  DeleteOperation: (options?: Collection.DeleteOperationOptions) => PropertyDecorator;
  UpdateOperation: (options?: Collection.UpdateOperationOptions) => PropertyDecorator;
  SearchOperation: (options?: Collection.SearchOperationOptions) => PropertyDecorator;
  UpdateManyOperation: (options?: Collection.UpdateManyOperationOptions) => PropertyDecorator;
  DeleteManyOperation: (options?: Collection.DeleteManyOperationOptions) => PropertyDecorator;
}


/**
 *
 */
export const Collection = function (this: Collection | void, ...args: any[]) {

  // ClassDecorator
  if (!this) {
    const [type, options] = args as [TypeThunkAsync | string, Collection.DecoratorOptions | undefined];
    return function (target: Function) {
      const name = options?.name || target.name.match(NAME_PATTERN)?.[1] || target.name;
      const metadata: Collection.Metadata = Reflect.getOwnMetadata(METADATA_KEY, target) || ({} as any);
      const baseMetadata = Reflect.getOwnMetadata(METADATA_KEY, Object.getPrototypeOf(target));
      if (baseMetadata) {
        merge(metadata, baseMetadata, {deep: true});
      }
      metadata.kind = OpraSchema.Collection.Kind;
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
  const [document, init] = args as [ApiDocument, Collection.InitArguments];

  // call super()
  Resource.apply(this, [document, init]);
} as CollectionConstructor;

const proto = {

  _construct(init: Collection.InitArguments): void {
    // call super()
    Resource.prototype._construct.call(this, init);

    const _this = this as Writable<Collection>;
    _this.kind = OpraSchema.Collection.Kind;
    _this.controller = init.controller;
    const operations = _this.operations = init.operations || {};
    const dataType = _this.type = init.type;
    // Validate key elements
    _this.primaryKey = init.primaryKey
        ? (Array.isArray(init.primaryKey) ? init.primaryKey : [init.primaryKey])
        : [];
    if (!_this.primaryKey.length)
      throw new TypeError(`You must provide primaryKey for Collection resource ("${_this.name}")`);
    _this.primaryKey.forEach(f => dataType.getElement(f));
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

  exportSchema(): OpraSchema.Collection {
    const out = Resource.prototype.exportSchema.call(this) as OpraSchema.Collection;
    Object.assign(out, omitUndefined({
      type: this.type.name,
      operations: this.operations,
      primaryKey: this.primaryKey
    }));
    return out;
  }
} as Collection;


Object.assign(Collection.prototype, proto);
Object.setPrototypeOf(Collection.prototype, Resource.prototype);

function createOperationDecorator<T>(operation: string) {
  return (options?: T) =>
      ((target: Object, propertyKey: string | symbol): void => {
        const metadata = {
          ...options,
          handlerName: propertyKey
        } as OpraSchema.Collection.CreateOperation;

        const resourceMetadata = (Reflect.getOwnMetadata(METADATA_KEY, target.constructor) || {}) as Collection.Metadata;
        resourceMetadata.operations = resourceMetadata.operations || {};
        resourceMetadata.operations[operation] = metadata;
        Reflect.defineMetadata(METADATA_KEY, resourceMetadata, target.constructor);
      });
}

Collection.CreateOperation = createOperationDecorator('create');
Collection.GetOperation = createOperationDecorator('get');
Collection.DeleteOperation = createOperationDecorator('delete');
Collection.UpdateOperation = createOperationDecorator('update');
Collection.SearchOperation = createOperationDecorator('search');
Collection.UpdateManyOperation = createOperationDecorator('updateMany');
Collection.DeleteManyOperation = createOperationDecorator('deleteMany');
