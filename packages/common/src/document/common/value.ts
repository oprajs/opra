import { omitUndefined } from '@jsopen/objects';
import type { Combine, StrictOmit, TypeThunkAsync } from 'ts-gems';
import { asMutable } from 'ts-gems';
import type { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document';
import { DataType } from '../data-type/data-type.js';
import type { EnumType } from '../data-type/enum-type.js';
import { DocumentElement } from './document-element.js';

/**
 * @namespace Value
 */
export namespace Value {
  export interface Metadata extends StrictOmit<OpraSchema.Value, 'type'> {
    type?:
      | string
      | TypeThunkAsync
      | EnumType.EnumObject
      | EnumType.EnumArray
      | object;
  }

  export interface Options extends Partial<StrictOmit<Metadata, 'type'>> {
    type?: string | TypeThunkAsync | object;
  }

  export interface InitArguments
    extends Combine<
      {
        type?: DataType;
      },
      Metadata
    > {}
}

/**
 * Type definition for Value
 * @class Value
 */
interface ValueStatic {
  new (owner: DocumentElement, args: Value.InitArguments): Value;

  prototype: Value;
}

/**
 * Type definition of Value prototype
 * @interface Value
 */
export interface Value extends ValueClass {}

export const Value = function (
  this: Value,
  owner: DocumentElement,
  initArgs: Value.InitArguments,
) {
  if (!this)
    throw new TypeError('"this" should be passed to call class constructor');
  DocumentElement.call(this, owner);
  // if (args.name && !PARAMETER_NAME_PATTERN.test(args.name))
  //   throw new TypeError(`"${args.name}" is not a valid parameter name`);
  const _this = asMutable(this);
  _this.description = initArgs.description;
  _this.type = initArgs.type;
  _this.examples = initArgs.examples;
  _this.isArray = initArgs.isArray;
} as Function as ValueStatic;

/**
 * @class Value
 */
class ValueClass extends DocumentElement {
  declare readonly owner: DocumentElement;
  declare readonly name: string | RegExp;
  type?: DataType;
  description?: string;
  examples?: any[] | Record<string, any>;
  isArray?: boolean;

  toJSON(options?: ApiDocument.ExportOptions): OpraSchema.Value {
    const typeName = this.type
      ? this.node.getDataTypeNameWithNs(this.type)
      : undefined;
    return omitUndefined<OpraSchema.Value>({
      type: this.type
        ? typeName
          ? typeName
          : this.type.toJSON(options)
        : 'any',
      description: this.description,
      isArray: this.isArray,
      examples: this.examples,
    });
  }
}

Value.prototype = ValueClass.prototype;
