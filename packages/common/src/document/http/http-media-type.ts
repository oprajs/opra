import { asMutable, Combine, StrictOmit, Type } from 'ts-gems';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { DocumentElement } from '../common/document-element.js';
import { DataType } from '../data-type/data-type.js';
import type { HttpMultipartField } from './http-multipart-field.js';

/**
 * @namespace HttpMediaType
 */
export namespace HttpMediaType {
  export interface Metadata extends Partial<StrictOmit<OpraSchema.HttpMediaType, 'type' | 'multipartFields'>> {
    type?: Type | string;
    multipartFields?: HttpMultipartField.Metadata[];
  }

  export interface Options extends Partial<StrictOmit<OpraSchema.HttpMediaType, 'type' | 'multipartFields'>> {
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
  new (parent: DocumentElement, initArgs: HttpMediaType.InitArguments): HttpMediaType;

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
  if (!this) throw new TypeError('"this" should be passed to call class constructor');
  DocumentElement.call(this, owner);

  const _this = asMutable(this);
  if (initArgs.contentType) {
    let arr = Array.isArray(initArgs.contentType) ? initArgs.contentType : [initArgs.contentType];
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
  _this.minFileSize = initArgs.minFileSize;
  if (initArgs?.type) {
    _this.type = initArgs?.type instanceof DataType ? initArgs.type : _this.owner.node.getDataType(initArgs.type);
  }
  _this.isArray = initArgs.isArray;
} as Function as HttpMediaTypeStatic;

/**
 * @class HttpMediaType
 */
class HttpMediaTypeClass extends DocumentElement {
  declare readonly owner: DocumentElement;
  description?: string;
  contentType?: string | string[];
  contentEncoding?: string;
  type?: DataType;
  isArray?: boolean;
  example?: string;
  examples?: Record<string, string>;
  multipartFields: HttpMultipartField[];
  maxFields?: number;
  maxFieldsSize?: number;
  maxFiles?: number;
  maxFileSize?: number;
  maxTotalFileSize?: number;
  minFileSize?: number;

  findMultipartField(fieldName: string, fieldType?: OpraSchema.HttpMultipartFieldType): HttpMultipartField | undefined {
    if (!this.multipartFields) return;
    for (const f of this.multipartFields) {
      if (
        (!fieldType || fieldType === f.fieldType) &&
        ((f.fieldName instanceof RegExp && f.fieldName.test(fieldName)) || f.fieldName === fieldName)
      ) {
        return f;
      }
    }
  }

  toJSON(): OpraSchema.HttpMediaType {
    const typeName = this.type ? this.node.getDataTypeNameWithNs(this.type) : undefined;
    const out = omitUndefined<OpraSchema.HttpMediaType>({
      description: this.description,
      contentType: this.contentType,
      contentEncoding: this.contentEncoding,
      type: typeName ? typeName : this.type?.toJSON(),
      isArray: this.isArray,
      example: this.example,
      examples: this.examples,
      maxFields: this.maxFields,
      maxFieldsSize: this.maxFieldsSize,
      maxFiles: this.maxFiles,
      maxFileSize: this.maxFileSize,
      maxTotalFileSize: this.maxTotalFileSize,
      minFileSize: this.minFileSize,
    });
    if (this.multipartFields?.length) {
      out.multipartFields = this.multipartFields.map(x => x.toJSON());
    }
    return out;
  }
}

HttpMediaType.prototype = HttpMediaTypeClass.prototype;
