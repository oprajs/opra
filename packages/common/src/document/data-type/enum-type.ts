import 'reflect-metadata';
import omit from 'lodash.omit';
import merge from 'putil-merge';
import * as vg from 'valgen';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { METADATA_KEY } from '../constants.js';
import { DataType } from './data-type.js';

export namespace EnumType {
  export interface InitArguments extends DataType.InitArguments,
      Pick<OpraSchema.EnumType, 'base' | 'values' | 'meanings'> {
    base?: EnumType;
  }

  export interface Options<T,
      Keys extends (string | number | symbol) =
          T extends readonly any[] ? T[number] : keyof T
  > extends DataType.DecoratorOptions {
    name?: string;
    base?: OpraSchema.EnumObject;
    meanings?: Record<Keys, string>;
  }

  export interface Metadata extends OpraSchema.EnumType {
    name: string;
  }
}

class EnumTypeClass extends DataType {
  readonly kind = OpraSchema.EnumType.Kind;
  readonly base?: EnumType;
  readonly values: Record<string, string | number>;
  readonly meanings: Record<string, string>;
  readonly ownValues: Record<string, string | number>;
  readonly ownMeanings: Record<string, string>;
  protected _decoder?: vg.Validator<any, any>;
  protected _encoder?: vg.Validator<any, any>;

  constructor(document: ApiDocument, init: EnumType.InitArguments) {
    super(document, init);
    this.base = init.base;
    this.ownValues = init.values;
    this.ownMeanings = init.meanings || {};
    this.values = {...this.base?.values, ...this.ownValues};
    this.meanings = {...this.base?.meanings, ...this.ownMeanings};
  }

  exportSchema(): OpraSchema.EnumType {
    const out = DataType.prototype.exportSchema.call(this) as OpraSchema.EnumType;
    Object.assign(out, omitUndefined({
      base: this.base ?
          (this.base.name ? this.base.name : this.base.exportSchema()) : undefined,
      values: this.ownValues,
      meanings: this.ownMeanings
    }));
    return out;
  }

  protected _getDecoder(): vg.Validator<any, any> {
    if (!this._decoder)
      this._decoder = vg.isEnum(Object.values(this.values), {enumName: this.name});
    return this._decoder;
  }

  protected _getEncoder(): vg.Validator<any, any> {
    return this._getDecoder();
  }

}

export interface EnumTypeConstructor {
  new(document: ApiDocument, init?: EnumType.InitArguments): EnumType;

  <T extends OpraSchema.EnumObject | readonly (string | number)[]>(target: T, options?: EnumType.Options<T>): T;
}

export interface EnumType extends EnumTypeClass {
}

/**
 * @class EnumType
 */
export const EnumType = function (this: EnumType | void, ...args: any[]) {
  if (this) {
    // Constructor
    const [document, init] = args as [ApiDocument, EnumType.InitArguments];
    merge(this, new EnumTypeClass(document, init), {descriptor: true});
    return;
  }

  // Injector
  const [source, options] = args as [any, EnumType.Options<any> | undefined];
  const values = Array.isArray(source)
      ? source.reduce((obj, v) => {
        obj[v] = v;
        return obj;
      }, {})
      : source;
  const metadata = {
    kind: OpraSchema.EnumType.Kind,
    values
  };
  if (options)
    Object.assign(metadata, omit(options, ['kind', 'values']));
  Reflect.defineMetadata(METADATA_KEY, metadata, source);
  return values;

} as EnumTypeConstructor;

EnumType.prototype = EnumTypeClass.prototype;
