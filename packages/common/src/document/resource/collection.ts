import omit from 'lodash.omit';
import merge from 'putil-merge';
import { StrictOmit, Type } from 'ts-gems';
import * as vg from 'valgen';
import { BadRequestError } from '../../exception/index.js';
import { OpraFilter } from '../../filter/index.js';
import { omitUndefined } from '../../helpers/index.js';
import { translate } from '../../i18n/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { TypeThunkAsync } from '../../types.js';
import type { ApiDocument } from '../api-document.js';
import { METADATA_KEY } from '../constants.js';
import { ComplexType } from '../data-type/complex-type.js';
import { SimpleType } from '../data-type/simple-type.js';
import { generateCodec, GenerateDecoderOptions } from '../utils/generate-codec.js';
import { Resource } from './resource.js';

const NESTJS_INJECTABLE_WATERMARK = '__injectable__'; // todo, put this in nextjs package wia augmentation
const NAME_PATTERN = /^(.*)(Resource|Collection)$/;

export namespace Collection {
  export interface InitArguments extends Resource.InitArguments,
      StrictOmit<OpraSchema.Collection, 'kind' | 'type'> {
    type: ComplexType;
  }

  export interface DecoratorOptions<T = any> extends Resource.DecoratorOptions {
    primaryKey?: keyof T | (keyof T)[];
  }

  export interface Metadata extends StrictOmit<OpraSchema.Collection, 'type'> {
    name: string;
    type: TypeThunkAsync | string;
  }

  // Need for augmentation
  export namespace Create {
  }

  // Need for augmentation
  export namespace Delete {
  }

  // Need for augmentation
  export namespace DeleteMany {
  }

  // Need for augmentation
  export namespace FindMany {
  }

  // Need for augmentation
  export namespace Get {
  }

  // Need for augmentation
  export namespace Update {
  }

  // Need for augmentation
  export namespace UpdateMany {
  }

  export type CreateEndpointOptions = OpraSchema.Collection.CreateEndpoint;
  export type DeleteEndpointOptions = OpraSchema.Collection.DeleteEndpoint;
  export type DeleteManyEndpointOptions = OpraSchema.Collection.DeleteManyEndpoint;
  export type FindManyEndpointOptions = OpraSchema.Collection.FindManyEndpoint;
  export type GetEndpointOptions = OpraSchema.Collection.GetEndpoint;
  export type UpdateEndpointOptions = OpraSchema.Collection.UpdateEndpoint;
  export type UpdateManyEndpointOptions = OpraSchema.Collection.UpdateManyEndpoint;
}

class CollectionClass extends Resource {
  private _decoders: Record<string, vg.Validator<any>> = {};
  private _encoders: Record<string, vg.Validator<any>> = {};
  readonly type: ComplexType;
  readonly kind = OpraSchema.Collection.Kind;
  readonly endpoints: OpraSchema.Collection.Endpoints;
  readonly controller?: object;
  readonly primaryKey: string[];

  constructor(
      document: ApiDocument,
      init: Collection.InitArguments
  ) {
    super(document, init);
    this.controller = init.controller;
    this.endpoints = {...init.endpoints};
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
  }

  exportSchema(this: Collection): OpraSchema.Collection {
    const out = Resource.prototype.exportSchema.call(this) as OpraSchema.Collection;
    Object.assign(out, omitUndefined({
      type: this.type.name,
      endpoints: this.endpoints,
      primaryKey: this.primaryKey
    }));
    return out;
  }

  parseKeyValue(this: Collection, value: any): any {
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
        if (el.type instanceof SimpleType)
          obj[k] = el.type.decode(v);
        if (obj[k] == null)
          throw new TypeError(`You must provide value of primary field(s) (${k})`);
      }
    } else {
      const primaryKey = this.primaryKey[0];
      if (typeof value === 'object')
        value = value[primaryKey];
      const el = dataType.getField(primaryKey);
      let result: any;
      if (el.type instanceof SimpleType)
        result = el.type.decode(value);
      if (result == null)
        throw new TypeError(`You must provide value of primary field(s) (${primaryKey})`);
      return result;
    }
  }

  normalizeFieldPath(this: Collection, path: string | string[]): string[] | undefined {
    return this.type.normalizeFieldPath(path as any);
  }

  normalizeSortFields(this: Collection, fields: string | string[]): string[] | undefined {
    const normalized = this.type.normalizeFieldPath(fields);
    if (!normalized)
      return;
    const findManyOp = this.endpoints.findMany;
    const sortFields = findManyOp && findManyOp.sortFields;
    (Array.isArray(normalized) ? normalized : [normalized]).forEach(field => {
      if (!sortFields?.find(x => x === field))
        throw new BadRequestError({
          message: translate('error:UNACCEPTED_SORT_FIELD', {field}),
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
      // Check if filtering accepted for given field
      const findManyOp = this.endpoints.findMany;
      const fieldLower = ast.left.value.toLowerCase();
      const filterDef = (findManyOp && findManyOp.filters || [])
          .find(f => f.field.toLowerCase() === fieldLower);
      if (!filterDef) {
        throw new BadRequestError({
          message: translate('error:UNACCEPTED_FILTER_FIELD', {field: ast.left.value}),
        })
      }
      // Check if filtering endpoint accepted for given field
      if (!filterDef.operators?.includes(ast.op))
        throw new BadRequestError({
          message: translate('error:UNACCEPTED_FILTER_OPERATION', {field: ast.left.value}),
        })
      this.normalizeFilter(ast.right);
      return ast;
    }
    if (ast instanceof OpraFilter.LogicalExpression) {
      ast.items.forEach(item =>
          this.normalizeFilter(item));
      return ast;
    }
    if (ast instanceof OpraFilter.ArithmeticExpression) {
      ast.items.forEach(item =>
          this.normalizeFilter(item.expression));
      return ast;
    }
    if (ast instanceof OpraFilter.ArrayExpression) {
      ast.items.forEach(item =>
          this.normalizeFilter(item));
      return ast;
    }
    if (ast instanceof OpraFilter.ParenthesizedExpression) {
      this.normalizeFilter(ast.expression);
      return ast;
    }
    if (ast instanceof OpraFilter.QualifiedIdentifier) {
      const normalizedFieldPath = this.type.normalizeFieldPath(ast.value)?.join('.') as string;
      ast.field = this.type.getField(normalizedFieldPath);
      ast.dataType = ast.field?.type || this.document.getDataType('any');
      ast.value = normalizedFieldPath;
      return ast;
    }
    return ast;
  }

  getDecoder(endpoint: keyof OpraSchema.Collection.Endpoints): vg.Validator<any, any> {
    let decoder = this._decoders[endpoint];
    if (decoder)
      return decoder;
    const options: GenerateDecoderOptions = {
      partial: endpoint !== 'create'
    };
    if (endpoint !== 'create')
      options.omit = [...this.primaryKey];
    decoder = generateCodec(this.type, 'decode', options);
    this._decoders[endpoint] = decoder;
    return decoder;
  }

  getEncoder(endpoint: keyof OpraSchema.Collection.Endpoints): vg.Validator<any, any> {
    let encoder = this._encoders[endpoint];
    if (encoder)
      return encoder;
    const options: GenerateDecoderOptions = {
      partial: true
    };
    encoder = generateCodec(this.type, 'encode', options);
    if (endpoint === 'findMany')
      return vg.isArray(encoder);
    this._encoders[endpoint] = encoder;
    return encoder;
  }

}

export interface CollectionConstructor {
  prototype: Collection;

  new(document: ApiDocument, init: Collection.InitArguments): Collection;

  <T>(type: Type<T> | string, options?: Collection.DecoratorOptions<T>): ClassDecorator;

  Create: (options?: Collection.CreateEndpointOptions) => ((target: Object, propertyKey: 'create') => void);
  Delete: (options?: Collection.DeleteEndpointOptions) => ((target: Object, propertyKey: 'delete') => void);
  DeleteMany: (options?: Collection.DeleteManyEndpointOptions) => ((target: Object, propertyKey: 'deleteMany') => void);
  Get: (options?: Collection.GetEndpointOptions) => ((target: Object, propertyKey: 'get') => void);
  FindMany: (options?: Collection.FindManyEndpointOptions) => ((target: Object, propertyKey: 'findMany') => void);
  Update: (options?: Collection.UpdateEndpointOptions) => ((target: Object, propertyKey: 'update') => void);
  UpdateMany: (options?: Collection.UpdateManyEndpointOptions) => ((target: Object, propertyKey: 'updateMany') => void);
}

export interface Collection extends CollectionClass {
}

/**
 *
 */
export const Collection = function (this: Collection | void, ...args: any[]) {

  // ClassDecorator
  if (!this) {
    const [type, options] =
        args as [Type | string, Collection.DecoratorOptions<any> | undefined];
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

function createEndpointDecorator<T>(endpoint: string) {
  return (options?: T) =>
      ((target: Object, propertyKey: string | symbol): void => {
        if (propertyKey !== endpoint)
          throw new TypeError(`Name of the handler name should be '${endpoint}'`);
        const endpointMeta = {...options};
        const resourceMetadata =
            (Reflect.getOwnMetadata(METADATA_KEY, target.constructor) || {}) as Collection.Metadata;
        resourceMetadata.endpoints = resourceMetadata.endpoints || {};
        resourceMetadata.endpoints[endpoint] = endpointMeta;
        Reflect.defineMetadata(METADATA_KEY, resourceMetadata, target.constructor);
      });
}

Collection.Create = createEndpointDecorator('create');
Collection.Delete = createEndpointDecorator('delete');
Collection.DeleteMany = createEndpointDecorator('deleteMany');
Collection.Get = createEndpointDecorator('get');
Collection.FindMany = createEndpointDecorator('findMany');
Collection.Update = createEndpointDecorator('update');
Collection.UpdateMany = createEndpointDecorator('updateMany');
