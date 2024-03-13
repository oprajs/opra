import 'reflect-metadata';
import merge from 'putil-merge';
import { StrictOmit } from 'ts-gems';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiNode } from '../api-node';
import { DATATYPE_METADATA } from '../constants.js';
import { DataType } from './data-type.js';
import { EnumTypeClass } from './enum-type-class.js';

export interface EnumTypeConstructor {
  new(node: ApiNode, init?: EnumType.InitArguments): EnumType;

  <T extends EnumType.EnumObject | EnumType.EnumArray>(target: T, options: EnumType.Options<T>): EnumType.Metadata;
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
    let values: Record<OpraSchema.EnumType.Value, OpraSchema.EnumType.ValueInfo> = {};
    if (Array.isArray(enumSource)) {
      values = {};
      enumSource.forEach(k => {
        const description = options?.meanings?.[k];
        values[k] = omitUndefined({description});
      });
    } else {
      Object.keys(enumSource).forEach(k => {
        const description = options?.meanings?.[k];
        values[enumSource[k]] = omitUndefined({key: k, description});
      });
    }
    const metadata: EnumType.Metadata = {
      kind: OpraSchema.EnumType.Kind,
      values,
      base: options?.base,
      name: options?.name,
      description: options?.description
    };
    Object.defineProperty(enumSource, DATATYPE_METADATA, {
      value: metadata,
      enumerable: false,
      configurable: true,
      writable: true
    })
    return metadata;
  }

  // Constructor
  const [node, init] = args as [ApiNode, EnumType.InitArguments];
  merge(this, new EnumTypeClass(node, init), {descriptor: true});
  return;

} as EnumTypeConstructor;

EnumType.prototype = EnumTypeClass.prototype;


export namespace EnumType {
  export type EnumObject = Record<string, OpraSchema.EnumType.Value>;
  export type EnumArray = readonly string[];

  export interface Metadata extends StrictOmit<OpraSchema.EnumType, 'base'> {
    name?: string;
    base?: EnumObject | string;
  }

  export interface InitArguments extends DataType.InitArguments,
      Pick<OpraSchema.EnumType, 'base'> {
    enumObject?: object;
    base?: EnumType;
    values: Record<OpraSchema.EnumType.Value, OpraSchema.EnumType.ValueInfo>;
  }

  export interface Options<T,
      Keys extends (string | number | symbol) =
          T extends readonly any[] ? T[number] : keyof T
  > extends DataType.DecoratorOptions {
    name: string;
    base?: EnumObject;
    meanings?: Record<Keys, string>;
  }

}

