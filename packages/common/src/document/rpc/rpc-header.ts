import { asMutable, type Combine, type StrictOmit, type TypeThunkAsync } from 'ts-gems';
import { omitUndefined } from '../../helpers/index.js';
import type { OpraSchema } from '../../schema/index.js';
import { DocumentElement } from '../common/document-element.js';
import { Value } from '../common/value.js';
import { DataType } from '../data-type/data-type.js';
import type { EnumType } from '../data-type/enum-type.js';
import { parseRegExp } from '../utils/parse-regexp.util.js';

/**
 * @namespace RpcHeader
 */
export namespace RpcHeader {
  export interface Metadata extends StrictOmit<OpraSchema.RpcHeader, 'type'> {
    name: string | RegExp;
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
 * Type definition for RpcHeader
 * @class RpcHeader
 */
interface RpcHeaderStatic {
  new (owner: DocumentElement, args: RpcHeader.InitArguments): RpcHeader;

  prototype: RpcHeader;
}

/**
 * Type definition of RpcHeader prototype
 * @interface RpcHeader
 */
export interface RpcHeader extends RpcHeaderClass {}

export const RpcHeader = function (this: RpcHeader, owner: DocumentElement, initArgs: RpcHeader.InitArguments) {
  if (!this) throw new TypeError('"this" should be passed to call class constructor');
  Value.call(this, owner, initArgs);
  const _this = asMutable(this);
  if (initArgs.name) {
    _this.name =
      initArgs.name instanceof RegExp
        ? initArgs.name
        : initArgs.name.startsWith('/')
          ? parseRegExp(initArgs.name, {
              includeFlags: 'i',
              excludeFlags: 'm',
            })
          : initArgs.name;
  }
  _this.deprecated = initArgs.deprecated;
  _this.required = initArgs.required;
} as Function as RpcHeaderStatic;

/**
 * @class RpcHeader
 */
class RpcHeaderClass extends Value {
  declare readonly owner: DocumentElement;
  declare deprecated?: boolean | string;
  declare required?: boolean;

  toJSON(): OpraSchema.RpcHeader {
    return omitUndefined<OpraSchema.RpcHeader>({
      ...super.toJSON(),
      name: this.name,
      required: this.required,
      deprecated: this.deprecated,
    });
  }
}

RpcHeader.prototype = RpcHeaderClass.prototype;
