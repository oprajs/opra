import typeIs from '@browsery/type-is';
import { omitUndefined } from '@jsopen/objects';
import type { Combine, StrictOmit, Type } from 'ts-gems';
import { asMutable } from 'ts-gems';
import { isAny, type Validator, vg } from 'valgen';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { DocumentElement } from '../common/document-element.js';
import { DataType } from '../data-type/data-type.js';
import type { HttpMultipartField } from './http-multipart-field.js';

/**
 * @namespace HttpMediaType
 */
export namespace HttpMediaType {
  export interface Metadata
    extends Partial<
      StrictOmit<OpraSchema.HttpMediaType, 'type' | 'multipartFields'>
    > {
    type?: Type | string;
    multipartFields?: HttpMultipartField.Metadata[];
  }

  export interface Options
    extends Partial<
      StrictOmit<OpraSchema.HttpMediaType, 'type' | 'multipartFields'>
    > {
    type?: Type | string;
  }

  export interface InitArguments
    extends Combine<
      {
        type?: DataType | string | Type;
      },
      StrictOmit<Metadata, 'multipartFields'>
    > {}
}

/**
 * Type definition for HttpMediaType
 * @class HttpMediaType
 */
interface HttpMediaTypeStatic {
  new (
    parent: DocumentElement,
    initArgs: HttpMediaType.InitArguments,
  ): HttpMediaType;

  prototype: HttpMediaType;
}

/**
 * Type definition of HttpMediaType prototype
 * @interface HttpMediaType
 */
export interface HttpMediaType extends HttpMediaTypeClass {}

export const HttpMediaType = function (
  this: HttpMediaType,
  owner: DocumentElement,
  initArgs: HttpMediaType.InitArguments,
) {
  if (!this)
    throw new TypeError('"this" should be passed to call class constructor');
  DocumentElement.call(this, owner);

  const _this = asMutable(this);
  if (initArgs.contentType) {
    let arr = Array.isArray(initArgs.contentType)
      ? initArgs.contentType
      : [initArgs.contentType];
    arr = arr.map(x => x.split(/\s*,\s*/)).flat();
    _this.contentType = arr.length > 1 ? arr : arr[0];
  }
  _this.description = initArgs.description;
  _this.contentEncoding = initArgs.contentEncoding;
  _this.examples = initArgs.examples;
  _this.multipartFields = [];
  _this.maxFieldsSize = initArgs.maxFieldsSize;
  _this.maxFields = initArgs.maxFields;
  _this.maxFiles = initArgs.maxFiles;
  _this.maxFileSize = initArgs.maxFileSize;
  _this.maxTotalFileSize = initArgs.maxTotalFileSize;
  if (initArgs?.type) {
    _this.type =
      initArgs?.type instanceof DataType
        ? initArgs.type
        : _this.owner.node.getDataType(initArgs.type);
  }
  _this.isArray = initArgs.isArray;
} as Function as HttpMediaTypeStatic;

/**
 * @class HttpMediaType
 */
class HttpMediaTypeClass extends DocumentElement {
  declare readonly owner: DocumentElement;
  declare description?: string;
  declare contentType?: string | string[];
  declare contentEncoding?: string;
  declare type?: DataType;
  declare isArray?: boolean;
  declare example?: string;
  declare examples?: Record<string, string>;
  declare multipartFields: HttpMultipartField[];
  declare maxFields?: number;
  declare maxFieldsSize?: number;
  declare maxFiles?: number;
  declare maxFileSize?: number;
  declare maxTotalFileSize?: number;

  findMultipartField(
    fieldName: string,
    fieldType?: OpraSchema.HttpMultipartFieldType,
  ): HttpMultipartField | undefined {
    if (!this.multipartFields) return;
    for (const f of this.multipartFields) {
      if (
        (!fieldType || fieldType === f.fieldType) &&
        ((f.fieldName instanceof RegExp && f.fieldName.test(fieldName)) ||
          f.fieldName === fieldName)
      ) {
        return f;
      }
    }
  }

  toJSON(options?: ApiDocument.ExportOptions): OpraSchema.HttpMediaType {
    const typeName = this.type
      ? this.node.getDataTypeNameWithNs(this.type)
      : undefined;
    const out = omitUndefined<OpraSchema.HttpMediaType>({
      description: this.description,
      contentType: this.contentType,
      contentEncoding: this.contentEncoding,
      type: typeName ? typeName : this.type?.toJSON(options),
      isArray: this.isArray,
      example: this.example,
      examples: this.examples,
      maxFields: this.maxFields,
      maxFieldsSize: this.maxFieldsSize,
      maxFiles: this.maxFiles,
      maxFileSize: this.maxFileSize,
      maxTotalFileSize: this.maxTotalFileSize,
    });
    if (this.multipartFields?.length) {
      out.multipartFields = this.multipartFields.map(x => x.toJSON(options));
    }
    return out;
  }

  generateCodec(
    codec: 'encode' | 'decode',
    options?: DataType.GenerateCodecOptions,
  ): Validator {
    let fn: Validator | undefined;
    if (this.type) {
      fn = this.type.generateCodec(codec, options);
    } else if (this.contentType) {
      const arr = Array.isArray(this.contentType)
        ? this.contentType
        : [this.contentType];
      if (arr.find(ct => typeIs.is(ct, ['json']))) {
        fn = this.node.findDataType('object')!.generateCodec(codec);
      }
    }
    fn = fn || isAny;
    return this.isArray ? vg.isArray(fn) : fn;
  }
}

HttpMediaType.prototype = HttpMediaTypeClass.prototype;
