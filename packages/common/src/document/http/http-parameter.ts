import { asMutable, type Combine, type StrictOmit, type TypeThunkAsync } from 'ts-gems';
import { omitUndefined } from '../../helpers/index.js';
import type { OpraSchema } from '../../schema/index.js';
import { DocumentElement } from '../common/document-element.js';
import { Value } from '../common/value.js';
import { DataType } from '../data-type/data-type.js';
import type { EnumType } from '../data-type/enum-type.js';
import { parseRegExp } from '../utils/parse-regexp.util.js';

/**
 * @namespace HttpParameter
 */
export namespace HttpParameter {
  export interface Metadata extends StrictOmit<OpraSchema.HttpParameter, 'type'> {
    name: string | RegExp;
    type?: string | TypeThunkAsync | EnumType.EnumObject | EnumType.EnumArray | object;
    keyParam?: boolean;
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
 * Type definition for HttpParameter
 * @class HttpParameter
 */
interface HttpParameterStatic {
  new (owner: DocumentElement, args: HttpParameter.InitArguments): HttpParameter;

  prototype: HttpParameter;
}

/**
 * Type definition of HttpParameter prototype
 * @interface HttpParameter
 */
export interface HttpParameter extends HttpParameterClass {}

export const HttpParameter = function (
  this: HttpParameter,
  owner: DocumentElement,
  initArgs: HttpParameter.InitArguments,
) {
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
  _this.location = initArgs.location;
  _this.deprecated = initArgs.deprecated;
  _this.required = initArgs.required;
  if (_this.required == null && initArgs.location === 'path') _this.required = true;
  _this.arraySeparator = initArgs.arraySeparator;
  _this.keyParam = initArgs.keyParam;
} as Function as HttpParameterStatic;

/**
 * @class HttpParameter
 */
class HttpParameterClass extends Value {
  declare readonly owner: DocumentElement;
  declare location: OpraSchema.HttpParameterLocation;
  declare keyParam?: boolean;
  declare deprecated?: boolean | string;
  declare required?: boolean;
  declare arraySeparator?: string;

  toJSON(): OpraSchema.HttpParameter {
    return omitUndefined<OpraSchema.HttpParameter>({
      ...super.toJSON(),
      name: this.name,
      location: this.location,
      arraySeparator: this.arraySeparator,
      keyParam: this.keyParam,
      required: this.required,
      deprecated: this.deprecated,
    });
  }
}

HttpParameter.prototype = HttpParameterClass.prototype;
