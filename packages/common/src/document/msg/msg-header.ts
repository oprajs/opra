import { asMutable, type Combine, type StrictOmit, type TypeThunkAsync } from 'ts-gems';
import { omitUndefined } from '../../helpers/index.js';
import type { OpraSchema } from '../../schema/index.js';
import { DocumentElement } from '../common/document-element.js';
import { Value } from '../common/value.js';
import { DataType } from '../data-type/data-type.js';
import type { EnumType } from '../data-type/enum-type.js';
import { parseRegExp } from '../utils/parse-regexp.util.js';

/**
 * @namespace MsgHeader
 */
export namespace MsgHeader {
  export interface Metadata extends StrictOmit<OpraSchema.MsgHeader, 'type'> {
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
 * Type definition for MsgHeader
 * @class MsgHeader
 */
interface MsgHeaderStatic {
  new (owner: DocumentElement, args: MsgHeader.InitArguments): MsgHeader;

  prototype: MsgHeader;
}

/**
 * Type definition of MsgHeader prototype
 * @interface MsgHeader
 */
export interface MsgHeader extends MsgHeaderClass {}

export const MsgHeader = function (this: MsgHeader, owner: DocumentElement, initArgs: MsgHeader.InitArguments) {
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
} as Function as MsgHeaderStatic;

/**
 * @class MsgHeader
 */
class MsgHeaderClass extends Value {
  declare readonly owner: DocumentElement;
  declare deprecated?: boolean | string;
  declare required?: boolean;

  toJSON(): OpraSchema.MsgHeader {
    return omitUndefined<OpraSchema.MsgHeader>({
      ...super.toJSON(),
      name: this.name,
      required: this.required,
      deprecated: this.deprecated,
    });
  }
}

MsgHeader.prototype = MsgHeaderClass.prototype;
