import 'reflect-metadata';
import { asMutable, Combine } from 'ts-gems';
import { Validator, vg } from 'valgen';
import { cloneObject, omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { DocumentElement } from '../common/document-element.js';
import { DocumentInitContext } from '../common/document-init-context.js';
import { DATATYPE_METADATA, DECORATOR } from '../constants.js';
import { DataType } from './data-type.js';

/**
 * @namespace EnumType
 */
export namespace EnumType {
  export type EnumObject = Record<string, string | number>;
  export type EnumArray = readonly string[];

  export interface Metadata
    extends Combine<
      {
        kind: OpraSchema.EnumType.Kind;
        base?: EnumObject | EnumArray | string;
        name: string;
      },
      DataType.Metadata,
      OpraSchema.EnumType
    > {}

  export interface Options<T, Keys extends string | number | symbol = T extends readonly any[] ? T[number] : keyof T>
    extends Combine<
      {
        base?: EnumObject | EnumArray | string;
        meanings?: Record<Keys, string>;
      },
      DataType.Options
    > {}

  export interface InitArguments
    extends Combine<
      {
        kind: OpraSchema.EnumType.Kind;
        base?: EnumType;
        instance?: object;
      },
      DataType.InitArguments,
      EnumType.Metadata
    > {}
}

/**
 * Mixin type definition of class constructor and helper method for EnumType
 */
export interface EnumTypeStatic {
  /**
   * Class constructor of EnumType
   *
   * @param owner
   * @param args
   * @constructor
   */
  new (owner: DocumentElement, args?: EnumType.InitArguments): EnumType;

  <T extends EnumType.EnumObject, B extends EnumType.EnumObject>(
    enumSource: T,
    base: B,
    options: EnumType.Options<T>,
  ): B & T;

  <T extends EnumType.EnumArray, B extends EnumType.EnumArray>(
    enumSource: T,
    base: B,
    options: EnumType.Options<T>,
  ): B & T;

  <T extends EnumType.EnumObject | EnumType.EnumArray>(target: T, options: EnumType.Options<T>): T;
}

/**
 * Type definition of EnumType prototype
 * @interface EnumType
 */
export interface EnumType extends EnumTypeClass {}

/**
 * @class EnumType
 */
export const EnumType = function (this: EnumType | void, ...args: any[]) {
  // Injector
  if (!this) return EnumType[DECORATOR].apply(undefined, args);
  // Constructor
  const [owner, initArgs, context] = args as [DocumentElement, EnumType.InitArguments, DocumentInitContext | undefined];
  DataType.call(this, owner, initArgs, context);
  const _this = asMutable(this);
  _this.kind = OpraSchema.EnumType.Kind;
  if (initArgs.base) {
    // noinspection SuspiciousTypeOfGuard
    if (!(initArgs.base instanceof EnumType))
      throw new TypeError(`"${(initArgs.base as DataType).kind}" can't be set as base for a "${this.kind}"`);
    _this.base = initArgs.base;
  }
  _this.instance = initArgs.instance;
  _this.ownAttributes = cloneObject(initArgs.attributes || {});
  _this.attributes = _this.base ? cloneObject(_this.base.attributes) : {};
  for (const [k, el] of Object.entries(_this.ownAttributes)) {
    _this.attributes[k] = el;
  }
} as EnumTypeStatic;

/**
 * @class EnumType
 */
class EnumTypeClass extends DataType {
  readonly kind: OpraSchema.EnumType.Kind;
  readonly base?: EnumType;
  readonly instance?: object;
  readonly attributes: Record<string | number, OpraSchema.EnumType.ValueInfo>;
  readonly ownAttributes: Record<string | number, OpraSchema.EnumType.ValueInfo>;

  extendsFrom(baseType: DataType): boolean {
    if (!(baseType instanceof EnumType)) return false;
    if (baseType === this) return true;
    return !!this.base?.extendsFrom(baseType);
  }

  generateCodec(): Validator {
    return vg.isEnum(Object.keys(this.attributes) as any);
  }

  toJSON(): OpraSchema.EnumType {
    return omitUndefined<OpraSchema.EnumType>({
      ...(DataType.prototype.toJSON.call(this) as any),
      base: this.base ? (this.base.name ? this.base.name : this.base.toJSON()) : undefined,
      attributes: cloneObject(this.ownAttributes),
    });
  }
}

EnumType.prototype = EnumTypeClass.prototype;
Object.assign(EnumType, EnumTypeClass);

/**
 *
 */
function EnumTypeFactory(enumSource: object, ...args: any[]) {
  const base = args.length >= 2 ? args[0] : undefined;
  const options = args.length >= 2 ? args[1] : args[0];
  let attributes: Record<string | number, OpraSchema.EnumType.ValueInfo> = {};
  let out = enumSource;
  if (Array.isArray(enumSource)) {
    if (base) {
      if (!Array.isArray(base)) throw new TypeError('Both "target" and "base" arguments should be array');
      out = [...base, ...enumSource];
    }
    attributes = {};
    enumSource.forEach(k => {
      const description = options?.meanings?.[k];
      attributes[k] = omitUndefined({ description });
    });
  } else {
    if (base) {
      if (Array.isArray(base)) throw new TypeError('Both "target" and "base" arguments should be enum object');
      out = { ...base, ...enumSource };
    }
    Object.keys(enumSource).forEach(k => {
      const description = options?.meanings?.[k];
      attributes[enumSource[k]] = omitUndefined({ alias: k, description });
    });
  }
  const metadata: EnumType.Metadata = {
    kind: OpraSchema.EnumType.Kind,
    attributes,
    base: options.base,
    name: options.name,
    description: options?.description,
  };
  Object.defineProperty(enumSource, DATATYPE_METADATA, {
    value: metadata,
    enumerable: false,
    configurable: true,
    writable: true,
  });
  return out;
}

EnumType.prototype = EnumTypeClass.prototype;
EnumType[DECORATOR] = EnumTypeFactory;
