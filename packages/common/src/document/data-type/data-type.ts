import { omitUndefined } from '@jsopen/objects';
import { asMutable, type StrictOmit, type Type } from 'ts-gems';
import type { ValidationOptions, Validator } from 'valgen';
import { FieldsProjection } from '../../helpers/index.js';
import type { DataTypeBase } from '../../schema/data-type/data-type.interface.js';
import { OpraSchema } from '../../schema/index.js';
import { DocumentElement } from '../common/document-element.js';
import { DocumentInitContext } from '../common/document-init-context.js';
import { CLASS_NAME_PATTERN } from '../constants.js';
import {
  colorFgMagenta,
  colorFgYellow,
  colorReset,
  nodeInspectCustom,
} from '../utils/inspect.util.js';

/**
 * @namespace DataType
 */
export namespace DataType {
  export interface Metadata extends DataTypeBase {
    name?: string;
  }

  export interface Options
    extends Partial<StrictOmit<Metadata, 'kind' | 'examples'>> {
    embedded?: boolean;
  }

  export interface InitArguments extends DataType.Metadata {}

  export interface GenerateCodecOptions extends ValidationOptions {
    documentElement?: DocumentElement;
    caseInSensitive?: boolean;
    partial?: boolean | 'deep';
    projection?: string[] | FieldsProjection | '*';
    ignoreReadonlyFields?: boolean;
    ignoreWriteonlyFields?: boolean;
    ignoreHiddenFields?: boolean;
    allowPatchOperators?: boolean;
  }
}

interface DataTypeStatic {
  new (
    owner: DocumentElement,
    args?: DataType.InitArguments,
    context?: DocumentInitContext,
  ): DataType;

  prototype: DataType;
}

/**
 * Type definition of DataType prototype
 * @interface DataType
 */
export interface DataType extends DataTypeClass {}

/**
 * DataType constructor
 */
export const DataType = function (
  this: DataType,
  owner: DocumentElement,
  initArgs: DataType.InitArguments,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context?: DocumentInitContext,
) {
  if (!this)
    throw new TypeError('"this" should be passed to call class constructor');
  if (initArgs?.name && !CLASS_NAME_PATTERN.test(initArgs.name)) {
    throw new TypeError(`"${initArgs.name}" is not a valid DataType name`);
  }
  DocumentElement.call(this, owner);
  const _this = asMutable(this);
  _this.kind = initArgs.kind;
  _this.name = initArgs.name;
  _this.description = initArgs.description;
  _this.abstract = initArgs.abstract;
  _this.examples = initArgs.examples;
} as Function as DataTypeStatic;

/**
 *
 * @class DataType
 */
abstract class DataTypeClass extends DocumentElement {
  declare readonly kind: OpraSchema.DataType.Kind;
  declare readonly owner: DocumentElement;
  declare readonly name?: string;
  declare readonly description?: string;
  declare readonly abstract?: boolean;
  declare readonly examples?: OpraSchema.DataTypeExample[];

  abstract generateCodec(
    codec: 'encode' | 'decode',
    options?: DataType.GenerateCodecOptions,
  ): Validator;

  get embedded(): any {
    return !this.name;
  }

  abstract extendsFrom(baseType: DataType | string | Type | object): boolean;

  toJSON(): OpraSchema.DataType {
    return omitUndefined({
      kind: this.kind,
      description: this.description,
      abstract: this.abstract,
      examples: this.examples,
    }) as OpraSchema.DataType;
  }

  toString(): string {
    return `[${Object.getPrototypeOf(this).constructor.name} ${this.name || '#Embedded'}]`;
  }

  [nodeInspectCustom](): string {
    return (
      `[${colorFgYellow + Object.getPrototypeOf(this).constructor.name + colorReset}` +
      ` ${colorFgMagenta + this.name + colorReset}]`
    );
  }
}

DataType.prototype = DataTypeClass.prototype;
