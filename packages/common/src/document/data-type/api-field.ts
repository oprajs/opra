import { StrictOmit, Type, Writable } from 'ts-gems';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { TypeThunkAsync } from '../../types.js';
import { DATATYPE_METADATA } from '../constants.js';
import type { ComplexType } from './complex-type.js';
import { DataType } from './data-type.js';
import { EnumType } from './enum-type.js';

export namespace ApiField {
  export interface InitArguments extends StrictOmit<OpraSchema.Field, 'type'> {
    name: string;
    type: DataType;
    origin?: ComplexType;
  }

  export interface DecoratorOptions extends Partial<StrictOmit<OpraSchema.Field, 'isArray' | 'type'>> {
    type?: string | OpraSchema.DataType | TypeThunkAsync;
    enum?: OpraSchema.EnumObject | string[];
  }

  export interface Metadata extends StrictOmit<OpraSchema.Field, 'type'> {
    type?: string | OpraSchema.DataType | TypeThunkAsync;
    enum?: OpraSchema.EnumObject;
    designType?: Type;
  }
}

export interface ApiField extends StrictOmit<OpraSchema.Field, 'type'> {
  readonly owner: ComplexType;
  readonly origin?: ComplexType;
  readonly type: DataType;
  readonly name: string;

  exportSchema(): OpraSchema.Field;
}


/**
 * Type definition of ComplexType constructor type
 * @type ApiFieldConstructor
 */
export interface ApiFieldConstructor {
  new(owner: ComplexType, init: ApiField.InitArguments): ApiField;

  (options?: ApiField.DecoratorOptions): PropertyDecorator;

  prototype: ApiField;
}


/**
 * @class ComplexType
 */
export const ApiField = function (
    this: ApiField | void, ...args: any[]
) {
  // ClassDecorator
  if (!this) {
    const [options] = args as [ApiField.DecoratorOptions | undefined];
    return function (target: Object, propertyKey: string | symbol) {
      if (typeof propertyKey !== 'string')
        throw new TypeError(`Symbol properties can't be used as a field`);

      const metadata: ComplexType.Metadata = Reflect.getOwnMetadata(DATATYPE_METADATA, target.constructor) || ({} as any);
      metadata.kind = OpraSchema.ComplexType.Kind;
      metadata.fields = metadata.fields || {};

      const designType = Reflect.getMetadata('design:type', target, propertyKey);
      const elemMeta: ApiField.Metadata = metadata.fields[propertyKey] = {
        ...options,
        enum: undefined,
        designType
      }
      if (designType === Array) {
        elemMeta.isArray = true;
        delete elemMeta.designType;
      }

      if (options?.enum) {
        elemMeta.type = undefined;
        if (Array.isArray(options.enum)) {
          const enumObj = options.enum.reduce((o, v) => {
            o[v] = v;
            return o;
          }, {});
          EnumType(enumObj);
          elemMeta.enum = enumObj;
        } else {
          const m = Reflect.getOwnMetadata(DATATYPE_METADATA, options?.enum);
          if (!OpraSchema.isEnumType(m))
            throw new TypeError(`Invalid "enum" value. Did you forget to set metadata using EnumType() method?`);
          elemMeta.enum = options.enum;
        }
      }
      Reflect.defineMetadata(DATATYPE_METADATA, omitUndefined(metadata), target.constructor);
    }
  }

  // Constructor
  const [owner, init] = args as [ComplexType, ApiField.InitArguments];
  const _this = this as Writable<ApiField>;
  _this.owner = owner;
  _this.name = init.name;
  _this.origin = init.origin || owner;
  _this.type = init.type;
  if (init?.description)
    this.description = init?.description;
  if (init?.isArray != null)
    this.isArray = init?.isArray;
  this.default = init?.default;
  this.fixed = init?.fixed;
  if (init?.deprecated != null)
    this.deprecated = init?.deprecated;
  if (init?.exclusive != null)
    this.exclusive = init?.exclusive;
  if (init?.required != null)
    this.required = init?.required;
} as ApiFieldConstructor;


const proto = {
  exportSchema(): OpraSchema.Field {
    return omitUndefined({
      type: this.type.name ? this.type.name : this.type.exportSchema(),
      description: this.description,
      isArray: this.isArray,
      default: this.default,
      fixed: this.fixed,
      required: this.required
    }) satisfies OpraSchema.Field;
  }
} as ApiField;

Object.assign(ApiField.prototype, proto);
