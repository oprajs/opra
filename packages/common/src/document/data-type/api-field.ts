import { omitUndefined } from '@jsopen/objects';
import type { Combine, StrictOmit, TypeThunkAsync } from 'ts-gems';
import { asMutable } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { DocumentElement } from '../common/document-element.js';
import { DECORATOR } from '../constants.js';
import { ApiFieldDecoratorFactory } from '../decorators/api-field-decorator.js';
import { testScopeMatch } from '../utils/test-scope-match.js';
import type { ComplexType } from './complex-type.js';
import { ComplexTypeBase } from './complex-type-base.js';
import type { DataType } from './data-type.js';
import type { EnumType } from './enum-type.js';
import type { MappedType } from './mapped-type.js';
import type { MixinType } from './mixin-type.js';

/**
 * Type definition of ComplexType constructor type
 * @type ApiFieldConstructor
 */
export interface ApiFieldConstructor extends ApiFieldDecoratorFactory {
  prototype: ApiField;

  new (
    owner: ComplexType | MappedType | MixinType,
    args: ApiField.InitArguments,
  ): ApiField;
}

/**
 * The ApiField represents a descriptive metadata structure for API fields,
 * supporting features like data type definition, scoping, localization, and constraints.
 * This class extends DocumentElement, inheriting base document structure capabilities.
 *
 * @class ApiField
 */
export interface ApiField extends ApiFieldClass {}

/**
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
    throw new Error(
      'Field origin should be one of ComplexType, MappedType or MixinType',
    );
  }
  _this.origin = origin;
  _this.scopePattern = initArgs.scopePattern;
  _this.type = initArgs.type || owner.node.getDataType('any');
  _this.description = initArgs.description;
  _this.isArray = initArgs.isArray;
  _this.default = initArgs.default;
  _this.fixed = initArgs.fixed;
  _this.required = initArgs.required;
  _this.exclusive = initArgs.exclusive;
  _this.localization = initArgs.localization;
  _this.keyField = initArgs.keyField;
  _this.deprecated = initArgs.deprecated;
  _this.readonly = initArgs.readonly;
  _this.writeonly = initArgs.writeonly;
  _this.examples = initArgs.examples;
} as ApiFieldConstructor;

/**
 * The ApiFieldClass represents a descriptive metadata structure for API fields,
 * supporting features like data type definition, scoping, localization, and constraints.
 * This class extends DocumentElement, inheriting base document structure capabilities.
 */
class ApiFieldClass extends DocumentElement {
  declare readonly owner: ComplexType | MappedType | MixinType;
  readonly origin?: ComplexType | MappedType | MixinType;
  declare readonly scopePattern?: (string | RegExp)[];
  declare readonly name: string;
  declare readonly type: DataType;
  declare readonly description?: string;
  declare readonly isArray?: boolean;
  declare readonly default?: any;
  declare readonly fixed?: any;
  declare readonly required?: boolean;
  declare readonly exclusive?: boolean;
  declare readonly localization?: boolean;
  declare readonly keyField?: string;
  declare readonly deprecated?: boolean | string;
  declare readonly readonly?: boolean;
  declare readonly writeonly?: boolean;
  declare readonly examples?: any[] | Record<string, any>;

  inScope(scope: string): boolean {
    return testScopeMatch(scope, this.scopePattern);
  }

  toJSON(options?: ApiDocument.ExportOptions): OpraSchema.Field {
    const typeName = this.type
      ? this.node.getDataTypeNameWithNs(this.type)
      : undefined;
    return omitUndefined<OpraSchema.Field>({
      type: typeName ? typeName : (this.type?.toJSON(options) as any),
      description: this.description,
      isArray: this.isArray || undefined,
      default: this.default,
      fixed: this.fixed,
      required: this.required || undefined,
      exclusive: this.exclusive || undefined,
      localization: this.localization || undefined,
      keyField: this.keyField || undefined,
      deprecated: this.deprecated || undefined,
      readonly: this.readonly || undefined,
      writeonly: this.writeonly || undefined,
      examples: this.examples,
    }) as OpraSchema.Field;
  }
}

ApiField.prototype = ApiFieldClass.prototype;
Object.assign(ApiField, ApiFieldDecoratorFactory);
ApiField[DECORATOR] = ApiFieldDecoratorFactory;

/**
 * @namespace ApiField
 */
export namespace ApiField {
  export interface Metadata
    extends Combine<
      {
        type?:
          | string
          | OpraSchema.DataType
          | TypeThunkAsync
          | EnumType.EnumObject
          | EnumType.EnumArray
          | object;
      },
      OpraSchema.Field
    > {
    scopePattern?: (string | RegExp)[];
    overrides?: StrictOmit<Metadata, 'overrides' | 'type' | 'isArray'>[];
  }

  export interface Options
    extends Partial<StrictOmit<Metadata, 'overrides' | 'scopePattern'>> {
    /**
     * A variable that defines the pattern or patterns used to determine scope.
     * This can either be a single string or regular expression, or an array containing multiple strings or regular expressions.
     *
     * - If a single string or RegExp is provided, it is directly used as the scope pattern.
     * - If an array is provided, each element within the array is used as a valid scope pattern.
     */
    scopePattern?: (string | RegExp) | (string | RegExp)[];
  }

  export interface InitArguments
    extends Combine<
      {
        name: string;
        origin?: ComplexType | MappedType | MixinType;
        type?: DataType;
      },
      Metadata
    > {
    scopePattern?: (string | RegExp)[];
  }
}
