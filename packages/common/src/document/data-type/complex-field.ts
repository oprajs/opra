import { StrictOmit, Type, Writable } from 'ts-gems';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { TypeThunkAsync } from '../../types.js';
import { METADATA_KEY } from '../constants.js';
import type { ComplexType } from './complex-type.js';
import { DataType } from './data-type.js';
import { EnumType } from './enum-type.js';

export namespace ComplexField {
  export interface InitArguments extends StrictOmit<OpraSchema.ComplexField, 'type'> {
    name: string;
    type: DataType;
    origin?: ComplexType;
  }

  export interface DecoratorOptions extends Partial<StrictOmit<OpraSchema.ComplexField, 'isArray' | 'type'>> {
    type?: string | OpraSchema.DataType | TypeThunkAsync;
    enum?: OpraSchema.EnumObject | string[];
  }

  export interface Metadata extends StrictOmit<OpraSchema.ComplexField, 'type'> {
    type?: string | OpraSchema.DataType | TypeThunkAsync;
    enum?: OpraSchema.EnumObject;
    designType?: Type;
  }
}

export interface ComplexField extends StrictOmit<OpraSchema.ComplexField, 'type'> {
  readonly owner: ComplexType;
  readonly origin?: ComplexType;
  readonly type: DataType;
  readonly name: string;

  exportSchema(): OpraSchema.ComplexField;
}


/**
 * Type definition of ComplexType constructor type
 * @type ComplexFieldConstructor
 */
export interface ComplexFieldConstructor {
  new(owner: ComplexType, init: ComplexField.InitArguments): ComplexField;

  (options?: ComplexField.DecoratorOptions): PropertyDecorator;

  prototype: ComplexField;
}


/**
 * @class ComplexType
 */
export const ComplexField = function (
    this: ComplexField | void, ...args: any[]
) {
  // ClassDecorator
  if (!this) {
    const [options] = args as [ComplexField.DecoratorOptions | undefined];
    return function (target: Object, propertyKey: string | symbol) {
      if (typeof propertyKey !== 'string')
        throw new TypeError(`Symbol properties can't be used as a field`);

      const metadata: ComplexType.Metadata = Reflect.getOwnMetadata(METADATA_KEY, target.constructor) || ({} as any);
      metadata.kind = OpraSchema.ComplexType.Kind;
      metadata.fields = metadata.fields || {};

      const designType = Reflect.getMetadata('design:type', target, propertyKey);
      const isArray = designType === Array;
      const elemMeta: ComplexField.Metadata = metadata.fields[propertyKey] = {
        ...options,
        enum: undefined,
        designType: isArray ? undefined : designType
      }
      if (designType === Array)
        elemMeta.isArray = true;
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
          const m = Reflect.getOwnMetadata(METADATA_KEY, options?.enum);
          if (!OpraSchema.isEnumType(m))
            throw new TypeError(`Invalid "enum" value. Did you forget to set metadata using EnumType() method?`);
          elemMeta.enum = options.enum;
        }
      }
      Reflect.defineMetadata(METADATA_KEY, omitUndefined(metadata), target.constructor);
    }
  }

  // Constructor
  const [owner, init] = args as [ComplexType, ComplexField.InitArguments];
  const _this = this as Writable<ComplexField>;
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
} as ComplexFieldConstructor;


const proto = {
  exportSchema(): OpraSchema.ComplexField {
    const out: OpraSchema.ComplexField = {
      type: this.type.name ? this.type.name : this.type.exportSchema(),
      description: this.description,
      isArray: this.isArray,
      default: this.default,
      fixed: this.fixed
    };
    return out;
  }
} as ComplexField;

Object.assign(ComplexField.prototype, proto);
