import { asMutable, Combine, StrictOmit, TypeThunkAsync } from 'ts-gems';
import { omitUndefined } from '../../helpers/index.js';
import type { OpraSchema } from '../../schema/index.js';
import { DataType } from '../data-type/data-type.js';
import type { EnumType } from '../data-type/enum-type.js';
import { DocumentElement } from './document-element.js';

/**
 * @namespace Value
 */
export namespace Value {
  export interface Metadata extends StrictOmit<OpraSchema.Value, 'type'> {
    type?: string | TypeThunkAsync | EnumType.EnumObject | EnumType.EnumArray | object;
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

export const Value = function (this: Value, owner: DocumentElement, initArgs: Value.InitArguments) {
  if (!this) throw new TypeError('"this" should be passed to call class constructor');
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
  readonly owner: DocumentElement;
  readonly name: string | RegExp;
  type?: DataType;
  description?: string;
  examples?: any[] | Record<string, any>;
  isArray?: boolean;

  toJSON(): OpraSchema.Value {
    return omitUndefined<OpraSchema.Value>({
      type: this.type ? (this.type.name ? this.type.name : this.type.toJSON()) : 'any',
      description: this.description,
      isArray: this.isArray,
      examples: this.examples,
    });
  }
}

Value.prototype = ValueClass.prototype;
