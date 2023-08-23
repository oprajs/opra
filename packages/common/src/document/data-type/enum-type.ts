import 'reflect-metadata';
import omit from 'lodash.omit';
import merge from 'putil-merge';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { DATATYPE_METADATA } from '../constants.js';
import { DataType } from './data-type.js';
import { EnumTypeClass } from './enum-type-class.js';

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
  // Injector
  if (!this) {
    const [enumSource, options] = args as [any, EnumType.Options<any> | undefined];
    const values = Array.isArray(enumSource)
        ? enumSource.reduce((obj, v) => {
          obj[v] = v;
          return obj;
        }, {})
        : enumSource;
    const metadata = {
      kind: OpraSchema.EnumType.Kind,
      values
    };
    if (options)
      Object.assign(metadata, omit(options, ['kind', 'values']));
    Reflect.defineMetadata(DATATYPE_METADATA, metadata, enumSource);
    return values;
  }

  // Constructor
  const [document, init] = args as [ApiDocument, EnumType.InitArguments];
  merge(this, new EnumTypeClass(document, init), {descriptor: true});
  return;

} as EnumTypeConstructor;

EnumType.prototype = EnumTypeClass.prototype;


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

