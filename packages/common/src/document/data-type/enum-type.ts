import omit from 'lodash.omit';
import { StrictOmit, Writable } from 'ts-gems';
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

  export interface OwnProperties extends DataType.OwnProperties,
      Required<Readonly<Pick<OpraSchema.EnumType, 'values' | 'meanings'>>> {
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

export interface EnumType extends StrictOmit<DataType, 'own' | 'exportSchema'>, EnumType.OwnProperties {
  readonly base?: EnumType;
  readonly own: EnumType.OwnProperties;

  exportSchema(): OpraSchema.EnumType;
}

export interface EnumTypeConstructor {
  new(document: ApiDocument, init?: EnumType.InitArguments): EnumType;

  <T extends OpraSchema.EnumObject | readonly (string | number)[]>(target: T, options?: EnumType.Options<T>): T;
}

/**
 * @class EnumType
 */
export const EnumType = function (this: EnumType | void, ...args: any[]) {
  // Injector
  if (!this) {
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
  }

  // Constructor
  const [, init] = args as [any, EnumType.InitArguments];

  // call super()
  DataType.apply(this, args);
  const _this = this as Writable<EnumType>;
  _this.kind = OpraSchema.EnumType.Kind;
  _this.base = init.base;
  const own = _this.own as Writable<EnumType.OwnProperties>;
  own.values = init.values;
  own.meanings = init.meanings || {};

  _this.values = {..._this.base?.values, ...own.values};
  _this.meanings = {..._this.base?.meanings, ...own.meanings};

} as EnumTypeConstructor;

const proto = {

  exportSchema(): OpraSchema.EnumType {
    const out = DataType.prototype.exportSchema.call(this) as OpraSchema.EnumType;
    Object.assign(out, omitUndefined({
      base: this.base ?
          (this.base.name ? this.base.name : this.base.exportSchema()) : undefined,
      values: this.own.values,
      meanings: this.own.meanings
    }));
    return out;
  },

  validate(v: any): void {
    if (!this.values[v])
      throw new Error(`'${v}' is not a valid'${this.name ? ' ' + this.name : ''}' value`);
  }

} as EnumType;

Object.assign(EnumType.prototype, proto);
Object.setPrototypeOf(EnumType.prototype, DataType.prototype);
