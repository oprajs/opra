import type { Combine, TypeThunkAsync } from 'ts-gems';
import { asMutable } from 'ts-gems';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { DocumentElement } from '../common/document-element.js';
import { DECORATOR } from '../constants.js';
import { ApiFieldDecorator } from '../decorators/api-field-decorator.js';
import type { ComplexType } from './complex-type.js';
import { ComplexTypeBase } from './complex-type-base.js';
import type { DataType } from './data-type.js';
import type { EnumType } from './enum-type.js';
import type { MappedType } from './mapped-type.js';
import type { MixinType } from './mixin-type.js';

/**
 * @namespace ApiField
 */
export namespace ApiField {
  export interface Metadata
    extends Combine<
      {
        type?: string | OpraSchema.DataType | TypeThunkAsync | EnumType.EnumObject | EnumType.EnumArray | object;
      },
      OpraSchema.Field
    > {
    /**
     * If set true, field will be available for server side only and
     * will be removed while encoding to send to the client
     */
    hidden?: boolean;
  }

  export interface Options extends Partial<Metadata> {}

  export interface InitArguments
    extends Combine<
      {
        name: string;
        origin?: ComplexType | MappedType | MixinType;
        type?: DataType;
      },
      Metadata
    > {}
}

/**
 * Type definition of ComplexType constructor type
 * @type ApiFieldConstructor
 */
export interface ApiFieldConstructor extends ApiFieldDecorator {
  prototype: ApiField;

  new (owner: ComplexType | MappedType | MixinType, args: ApiField.InitArguments): ApiField;
}

/**
 * @class ApiField
 */
export interface ApiField extends ApiFieldClass {}

/**
 * @constructor ApiField
 * @decorator ApiField
 */
export const ApiField = function (this: ApiField | void, ...args: any[]) {
  // Decorator
  if (!this) {
    const [options] = args;
    return ApiField[DECORATOR](options);
  }
  // Constructor
  const [owner, initArgs] = args as [ComplexType, ApiField.InitArguments];
  DocumentElement.call(this, owner);
  const _this = asMutable(this);
  _this.name = initArgs.name;
  const origin = initArgs.origin || owner;
  /* istanbul ignore next */
  if (!(origin instanceof ComplexTypeBase)) {
    throw new Error('Field origin should be one of ComplexType, MappedType or MixinType');
  }
  _this.origin = origin;
  _this.type = initArgs.type || owner.node.getDataType('any');
  _this.description = initArgs.description;
  _this.isArray = initArgs.isArray;
  _this.default = initArgs.default;
  _this.fixed = initArgs.fixed;
  _this.required = initArgs.required;
  _this.exclusive = initArgs.exclusive;
  _this.translatable = initArgs.translatable;
  _this.arrayIdField = initArgs.arrayIdField;
  _this.deprecated = initArgs.deprecated;
  _this.readonly = initArgs.readonly;
  _this.writeonly = initArgs.writeonly;
  _this.examples = initArgs.examples;
  _this.hidden = initArgs.hidden;
} as ApiFieldConstructor;

/**
 *
 * @class ApiField
 */
class ApiFieldClass extends DocumentElement {
  declare readonly owner: ComplexType | MappedType | MixinType;
  readonly origin?: ComplexType | MappedType | MixinType;
  declare readonly name: string;
  declare readonly type: DataType;
  declare readonly description?: string;
  declare readonly isArray?: boolean; // todo this can be a separate type
  declare readonly default?: any;
  declare readonly fixed?: any;
  declare readonly required?: boolean;
  declare readonly exclusive?: boolean;
  declare readonly translatable?: boolean;
  declare readonly arrayIdField?: string;
  declare readonly deprecated?: boolean | string;
  declare readonly readonly?: boolean;
  declare readonly writeonly?: boolean;
  declare readonly examples?: any[] | Record<string, any>;
  /**
   * If set true, field will be available for server side only and
   * will be removed while encoding to send to the client
   */
  readonly hidden?: boolean;

  toJSON(): OpraSchema.Field {
    const typeName = this.type ? this.node.getDataTypeNameWithNs(this.type) : undefined;
    return omitUndefined<OpraSchema.Field>({
      type: typeName ? typeName : (this.type?.toJSON() as any),
      description: this.description,
      isArray: this.isArray || undefined,
      default: this.default,
      fixed: this.fixed,
      required: this.required || undefined,
      exclusive: this.exclusive || undefined,
      translatable: this.translatable || undefined,
      arrayIdField: this.arrayIdField || undefined,
      deprecated: this.deprecated || undefined,
      readonly: this.readonly || undefined,
      writeonly: this.writeonly || undefined,
      examples: this.examples,
    }) as OpraSchema.Field;
  }
}

ApiField.prototype = ApiFieldClass.prototype;
Object.assign(ApiField, ApiFieldDecorator);
ApiField[DECORATOR] = ApiFieldDecorator;
