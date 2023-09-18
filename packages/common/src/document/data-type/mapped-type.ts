import 'reflect-metadata';
import merge from 'putil-merge';
import { Class, StrictOmit, Type } from 'ts-gems';
import {
  inheritPropertyInitializers,
  mergePrototype
} from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { DATATYPE_METADATA } from '../constants.js';
import { ComplexType } from './complex-type.js';
import { getIsInheritedPredicateFn, MappedTypeClass } from './mapped-type-class.js';

/**
 *
 */
export function PickType<T extends any[], I1, S1, K extends keyof I1>(
    classRef: Class<T, I1, S1>,
    keys: readonly K[]
): Class<T, Pick<I1, K>> &
    Omit<Pick<S1, keyof typeof classRef>, 'prototype' | 'constructor'> {
  return MappedType(classRef, {pick: keys} as any) as any;
}

/**
 *
 */
export function OmitType<T extends any[], I1, S1, K extends keyof I1>(
    classRef: Class<T, I1, S1>, keys: readonly K[]
): Class<T, Omit<I1, K>> &
    Omit<Pick<S1, keyof typeof classRef>, 'prototype' | 'constructor'> {
  return MappedType(classRef, {omit: keys} as any) as any;
}


/**
 * Type definition of MappedType constructor type
 * @type MappedTypeConstructor
 */
export interface MappedTypeConstructor {
  prototype: MappedType;

  new(document: ApiDocument, init: MappedType.InitArguments): MappedType;

  <T extends any[], I1, S1,
      PickKey extends keyof I1,
      OmitKey extends keyof I1
  >(
      resource: Class<T, I1, S1>,
      options: {
        pickKeys?: readonly PickKey[],
        omitKeys?: readonly OmitKey[],
      }
  ): Class<T, Omit<Pick<I1, PickKey>, OmitKey>>;

  /* Used by extensions */
  _applyMixin(targetType: Type, sourceType: Type,
              options: MappedType.Options<any> &
                  {
                    isInheritedPredicate: (fieldName: string) => boolean;
                  }
  ): void;
}


/**
 * @class MappedType
 */
export const MappedType = function (
    this: MappedType,
    ...args: any[]
) {
  // Constructor
  if (this) {
    const [document, init] = args as [ApiDocument, MappedType.InitArguments];
    merge(this, new MappedTypeClass(document, init), {descriptor: true});
    return;
  }

  // MappedType helper
  const [mappedSource, options] = args as [Type, MappedType.Options<any>];
  const isInheritedPredicate = getIsInheritedPredicateFn(options.pick as string[], options.omit as string[]);

  class MappedClass {
    constructor() {
      inheritPropertyInitializers(this, mappedSource, isInheritedPredicate);
    }
  }

  mergePrototype(MappedClass.prototype, mappedSource.prototype);

  // const mappedTypeMetadata: MappedType.TypeMapping[] = [];
  const m = Reflect.getOwnMetadata(DATATYPE_METADATA, mappedSource) as OpraSchema.DataType;
  if (!m)
    throw new TypeError(`Class "${mappedSource}" doesn't have datatype metadata information`);
  if (!(m.kind === OpraSchema.ComplexType.Kind))
    throw new TypeError(`Class "${mappedSource}" is not a ${OpraSchema.ComplexType.Kind}`);

  const metadata: MappedType.Metadata = {
    kind: 'MappedType',
    base: mappedSource
  };
  if (options.pick)
    metadata.pick = options.pick as string[];
  if (options.omit)
    metadata.omit = options.omit as string[];
  Reflect.defineMetadata(DATATYPE_METADATA, metadata, MappedClass);

  MappedType._applyMixin(MappedClass, mappedSource, {
    ...options,
    isInheritedPredicate
  });

  return MappedClass as any;

} as MappedTypeConstructor;

MappedType.prototype = MappedTypeClass.prototype;
MappedType._applyMixin = () => void 0;


/**
 * Type definition of MappedType prototype
 * @type MappedType
 */
export interface MappedType extends MappedTypeClass {

}

/**
 * @namespace MappedType
 */
export namespace MappedType {

  export interface InitArguments extends ComplexType.InitArguments,
      Pick<OpraSchema.MappedType, 'pick' | 'omit'> {
  }

  export interface Metadata extends StrictOmit<ComplexType.Metadata, 'kind' | 'base' | 'name'>,
      Pick<OpraSchema.MappedType, 'pick' | 'omit'> {
    kind: OpraSchema.MappedType.Kind;
    base: Type;
  }

  export interface OwnProperties extends ComplexType.OwnProperties,
      Pick<OpraSchema.MappedType, 'pick' | 'omit'> {
  }

  export interface Options<T, K = keyof T> {
    pick?: readonly K[],
    omit?: readonly K[],
  }

}



