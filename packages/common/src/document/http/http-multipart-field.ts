import { omitUndefined } from '@jsopen/objects';
import type { Combine } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { parseRegExp } from '../utils/parse-regexp.util.js';
import { HttpMediaType } from './http-media-type.js';

/**
 * @namespace HttpMultipartField
 */
export namespace HttpMultipartField {
  export interface Metadata
    extends Combine<
      Pick<OpraSchema.HttpMultipartField, 'fieldName' | 'fieldType' | 'required'>,
      HttpMediaType.Metadata
    > {}

  export interface Options
    extends Combine<
      Pick<OpraSchema.HttpMultipartField, 'fieldName' | 'fieldType' | 'required'>,
      HttpMediaType.Options
    > {}

  export interface InitArguments
    extends Combine<
      Pick<OpraSchema.HttpMultipartField, 'fieldName' | 'fieldType' | 'required'>,
      HttpMediaType.InitArguments
    > {}
}

/**
 *
 * @class HttpMultipartField
 */
export class HttpMultipartField extends HttpMediaType {
  fieldName: string | RegExp;
  fieldType: OpraSchema.HttpMultipartFieldType;
  required?: boolean;

  constructor(owner: HttpMediaType | HttpMultipartField, initArgs: HttpMultipartField.InitArguments) {
    super(owner, initArgs);
    this.fieldName =
      initArgs.fieldName instanceof RegExp
        ? initArgs.fieldName
        : initArgs.fieldName.startsWith('/')
          ? parseRegExp(initArgs.fieldName)
          : initArgs.fieldName;
    this.fieldType = initArgs.fieldType;
    this.required = initArgs.required;
  }

  toJSON(): OpraSchema.HttpMultipartField {
    return omitUndefined({
      fieldName: this.fieldName,
      fieldType: this.fieldType,
      required: this.required,
      ...super.toJSON(),
    });
  }
}
