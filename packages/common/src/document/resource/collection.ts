import omit from 'lodash.omit';
import merge from 'putil-merge';
import { StrictOmit, Type, Writable } from 'ts-gems';
import { BadRequestError } from '../../exception/index.js';
import {
  ArithmeticExpression,
  ArrayExpression,
  ComparisonExpression,
  Expression,
  LogicalExpression,
  ParenthesesExpression,
  QualifiedIdentifier
} from '../../filter/index.js';
import { omitUndefined } from '../../helpers/index.js';
import { translate } from '../../i18n/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { TypeThunkAsync } from '../../types.js';
import type { ApiDocument } from '../api-document.js';
import { METADATA_KEY } from '../constants.js';
import type { ComplexType } from '../data-type/complex-type.js';
import { SimpleType } from '../data-type/simple-type.js';
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

  export type CreateOperationOptions = StrictOmit<OpraSchema.Collection.CreateOperation, 'handler'>;
  export type DeleteOperationOptions = StrictOmit<OpraSchema.Collection.DeleteOperation, 'handler'>;
  export type DeleteManyOperationOptions = StrictOmit<OpraSchema.Collection.DeleteManyOperation, 'handler'>;
  export type GetOperationOptions = StrictOmit<OpraSchema.Collection.GetOperation, 'handler'>;
  export type UpdateOperationOptions = StrictOmit<OpraSchema.Collection.UpdateOperation, 'handler'>;
  export type UpdateManyOperationOptions = StrictOmit<OpraSchema.Collection.UpdateManyOperation, 'handler'>;
  export type SearchOperationOptions = StrictOmit<OpraSchema.Collection.SearchOperation, 'handler'>;
}

export interface Collection extends StrictOmit<Resource, 'exportSchema' | '_construct'> {
  readonly type: ComplexType;
  readonly operations: Collection.Operations;
  readonly controller?: object;
  readonly primaryKey: string[];

  exportSchema(): OpraSchema.Collection;

  parseKeyValue(value: any): any;

  normalizeFieldNames(fields: string[]): string[] | undefined;

  normalizeSortFields(fields: string[]): string[] | undefined;

  normalizeFilterFields(ast: Expression): Expression;

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

  _construct(this: Collection, init: Collection.InitArguments): void {
    // call super()
    Resource.prototype._construct.call(this, init);

    const _this = this as Writable<Collection>;
    _this.kind = OpraSchema.Collection.Kind;
    _this.controller = init.controller;
    const operations = _this.operations = init.operations || {};
    const dataType = _this.type = init.type;
    // Validate key fields
    _this.primaryKey = init.primaryKey
        ? (Array.isArray(init.primaryKey) ? init.primaryKey : [init.primaryKey])
        : [];
    if (!_this.primaryKey.length)
      throw new TypeError(`You must provide primaryKey for Collection resource ("${_this.name}")`);
    _this.primaryKey.forEach(f => {
      const el = dataType.getField(f);
      if (!(el.type instanceof SimpleType))
        throw new TypeError(`Only Simple type allowed for primary keys but "${f}" is a ${el.type.kind}`);
    });
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

  exportSchema(this: Collection): OpraSchema.Collection {
    const out = Resource.prototype.exportSchema.call(this) as OpraSchema.Collection;
    Object.assign(out, omitUndefined({
      type: this.type.name,
      operations: this.operations,
      primaryKey: this.primaryKey
    }));
    return out;
  },

  parseKeyValue(this: Collection, value: any): any | undefined {
    if (!this.primaryKey?.length)
      return;
    const dataType = this.type;
    if (this.primaryKey.length > 1) {
      // Build primary key/value mapped object
      const obj = Array.isArray(value)
          ? this.primaryKey.reduce((o, k, i) => {
            o[k] = value[i];
            return obj;
          }, {} as any)
          : value;
      // decode values
      for (const [k, v] of Object.entries(obj)) {
        const el = dataType.getField(k);
        obj[k] = (el.type as SimpleType).decode(v);
        if (obj[k] == null)
          throw new TypeError(`You must provide value of primary field(s) (${k})`);
      }
    } else {
      const primaryKey = this.primaryKey[0];
      if (typeof value === 'object')
        value = value[primaryKey];
      const el = dataType.getField(primaryKey);
      const result = (el.type as SimpleType).decode(value);
      if (result == null)
        throw new TypeError(`You must provide value of primary field(s) (${primaryKey})`);
      return result;
    }
  },

  normalizeFieldNames(this: Collection, fields: string | string[]): string[] | undefined {
    return this.type.normalizeFieldNames(fields);
  },

  normalizeSortFields(this: Collection, fields: string[]): string[] | undefined {
    const normalized = this.normalizeFieldNames(fields);
    if (!normalized)
      return;
    const searchEndpoint = this.operations.search;
    const sortFields = searchEndpoint && searchEndpoint.sortFields;
    normalized.forEach(field => {
      if (!sortFields?.find(x => x === field))
        throw new BadRequestError({
          message: translate('error:UNACCEPTED_SORT_FIELD', {field},
              `Field '${field}' is not available for sort operation`),
        })
    });
    return normalized;
  },

  normalizeFilterFields(ast: Expression): Expression {
    if (ast instanceof ComparisonExpression) {
      this.normalizeFilterFields(ast.left);
    } else if (ast instanceof LogicalExpression) {
      ast.items.forEach(item =>
          this.normalizeFilterFields(item));
    } else if (ast instanceof ArithmeticExpression) {
      ast.items.forEach(item =>
          this.normalizeFilterFields(item.expression));
    } else if (ast instanceof ArrayExpression) {
      ast.items.forEach(item =>
          this.normalizeFilterFields(item));
    } else if (ast instanceof ParenthesesExpression) {
      this.normalizeFilterFields(ast.expression);
    } else if (ast instanceof QualifiedIdentifier) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ast.value = this.normalizeFieldNames([ast.value])![0];
    }
    return ast;
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
