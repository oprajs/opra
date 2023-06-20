import omit from 'lodash.omit';
import merge from 'putil-merge';
import { StrictOmit, Type } from 'ts-gems';
import { BadRequestError } from '../../exception/index.js';
import { OpraFilter } from '../../filter/index.js';
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
    get?: OpraSchema.Collection.GetOperation & Operation;
    update?: OpraSchema.Collection.UpdateOperation & Operation;
    deleteMany?: OpraSchema.Collection.DeleteManyOperation & Operation;
    findMany?: OpraSchema.Collection.FindManyOperation & Operation;
    updateMany?: OpraSchema.Collection.UpdateManyOperation & Operation;
  }

  export type CreateOperationOptions = StrictOmit<OpraSchema.Collection.CreateOperation, 'handler'>;
  export type DeleteOperationOptions = StrictOmit<OpraSchema.Collection.DeleteOperation, 'handler'>;
  export type DeleteManyOperationOptions = StrictOmit<OpraSchema.Collection.DeleteManyOperation, 'handler'>;
  export type FindManyOperationOptions = StrictOmit<OpraSchema.Collection.FindManyOperation, 'handler'>;
  export type GetOperationOptions = StrictOmit<OpraSchema.Collection.GetOperation, 'handler'>;
  export type UpdateOperationOptions = StrictOmit<OpraSchema.Collection.UpdateOperation, 'handler'>;
  export type UpdateManyOperationOptions = StrictOmit<OpraSchema.Collection.UpdateManyOperation, 'handler'>;
}

class CollectionClass extends Resource {
  readonly type: ComplexType;
  readonly kind = OpraSchema.Collection.Kind;
  readonly operations: Collection.Operations;
  readonly controller?: object;
  readonly primaryKey: string[];

  constructor(
      document: ApiDocument,
      init: Collection.InitArguments
  ) {
    super(document, init);
    this.controller = init.controller;
    const operations = this.operations = init.operations || {};
    const dataType = this.type = init.type;
    // Validate key fields
    this.primaryKey = init.primaryKey
        ? (Array.isArray(init.primaryKey) ? init.primaryKey : [init.primaryKey])
        : [];
    if (!this.primaryKey.length)
      throw new TypeError(`You must provide primaryKey for Collection resource ("${this.name}")`);
    this.primaryKey.forEach(f => {
      const field = dataType.getField(f);
      if (!(field?.type instanceof SimpleType))
        throw new TypeError(`Only Simple type allowed for primary keys but "${f}" is a ${field.type.kind}`);
    });
    if (this.controller) {
      const instance = typeof this.controller == 'function'
          ? new (this.controller as Type)()
          : this.controller;
      for (const operation of Object.values(operations)) {
        if (!operation.handler && operation.handlerName) {
          const fn = instance[operation.handlerName];
          if (!fn)
            throw new TypeError(`No such operation handler (${operation.handlerName}) found`);
          operation.handler = fn.bind(instance);
        }
      }
    }
  }

  exportSchema(this: Collection): OpraSchema.Collection {
    const out = Resource.prototype.exportSchema.call(this) as OpraSchema.Collection;
    Object.assign(out, omitUndefined({
      type: this.type.name,
      operations: this.operations,
      primaryKey: this.primaryKey
    }));
    return out;
  }

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
  }

  normalizeFieldPath(this: Collection, path: string | string[]): string | string[] {
    return this.type.normalizeFieldPath(path as any);
  }

  normalizeSortFields(this: Collection, fields: string | string[]): string | string[] {
    const normalized = this.type.normalizeFieldPath(fields as any);
    const findManyEndpoint = this.operations.findMany;
    const sortFields = findManyEndpoint && findManyEndpoint.sortFields;
    (Array.isArray(normalized) ? normalized : [normalized]).forEach(field => {
      if (!sortFields?.find(x => x === field))
        throw new BadRequestError({
          message: translate('error:UNACCEPTED_SORT_FIELD', {field},
              `Field '${field}' is not available for sort operation`),
        })
    });
    return normalized;
  }

  normalizeFilter(filter: string | OpraFilter.Expression): OpraFilter.Expression | undefined {
    if (!filter)
      return;
    const ast = typeof filter === 'string' ? OpraFilter.parse(filter) : filter;
    if (ast instanceof OpraFilter.ComparisonExpression) {
      this.normalizeFilter(ast.left);
      if (!(ast.left instanceof OpraFilter.QualifiedIdentifier && ast.left.field))
        throw new TypeError(`Invalid filter query. Left side should be a data field.`);
      this.normalizeFilter(ast.right);
    } else if (ast instanceof OpraFilter.LogicalExpression) {
      ast.items.forEach(item =>
          this.normalizeFilter(item));
    } else if (ast instanceof OpraFilter.ArithmeticExpression) {
      ast.items.forEach(item =>
          this.normalizeFilter(item.expression));
    } else if (ast instanceof OpraFilter.ArrayExpression) {
      ast.items.forEach(item =>
          this.normalizeFilter(item));
    } else if (ast instanceof OpraFilter.ParenthesizedExpression) {
      this.normalizeFilter(ast.expression);
    } else if (ast instanceof OpraFilter.QualifiedIdentifier) {
      ast.field = this.type.findField(ast.value);
      ast.dataType = ast.field?.type || this.document.getDataType('any');
      ast.value = this.type.normalizeFieldPath(ast.value);
    }
    return ast;
  }
}

export interface CollectionConstructor {
  prototype: Collection;

  new(document: ApiDocument, init: Collection.InitArguments): Collection;

  (type: TypeThunkAsync | string, options?: Collection.DecoratorOptions): ClassDecorator;

  Create: (options?: Collection.CreateOperationOptions) => PropertyDecorator;
  Delete: (options?: Collection.DeleteOperationOptions) => PropertyDecorator;
  Get: (options?: Collection.GetOperationOptions) => PropertyDecorator;
  Update: (options?: Collection.UpdateOperationOptions) => PropertyDecorator;
  FindMany: (options?: Collection.FindManyOperationOptions) => PropertyDecorator;
  DeleteMany: (options?: Collection.DeleteManyOperationOptions) => PropertyDecorator;
  UpdateMany: (options?: Collection.UpdateManyOperationOptions) => PropertyDecorator;
}

export interface Collection extends CollectionClass {
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
  merge(this, new CollectionClass(document, init), {descriptor: true});

} as CollectionConstructor;

Collection.prototype = CollectionClass.prototype;

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

Collection.Create = createOperationDecorator('create');
Collection.Delete = createOperationDecorator('delete');
Collection.DeleteMany = createOperationDecorator('deleteMany');
Collection.Get = createOperationDecorator('get');
Collection.FindMany = createOperationDecorator('findMany');
Collection.Update = createOperationDecorator('update');
Collection.UpdateMany = createOperationDecorator('updateMany');
