import { Class } from 'ts-gems';
import { DATATYPE_METADATA, MAPPED_TYPE_METADATA } from '../constants.js';
import { applyMixins, inheritPropertyInitializers } from './mixin.utils.js';

const optionalsSymbol = Symbol.for('opra.optional-lib.sqb-connect');

export function PickType<T extends any[], I1, S1, K extends keyof I1>(
    classRef: Class<T, I1, S1>, keys: readonly K[]
): Class<T, Pick<I1, K>> &
    Omit<Pick<S1, keyof typeof classRef>, 'prototype' | 'constructor'> {
  return ExtendType(classRef, classRef, {pickKeys: keys});
}

export function OmitType<T extends any[], I1, S1, K extends keyof I1>(
    classRef: Class<T, I1, S1>, keys: readonly K[]
): Class<T, Omit<I1, K>> &
    Omit<Pick<S1, keyof typeof classRef>, 'prototype' | 'constructor'> {
  return ExtendType(classRef, classRef, {omitKeys: keys});
}

function ExtendType<T extends any[], I1, S1,
    PickKey extends keyof I1,
    OmitKey extends keyof I1,
    // RequiredKey extends keyof I1,
    // PartialKey extends keyof I1,
    // ReadonlyKey extends keyof I1,
    // WritableKey extends keyof I1,
>(
    classRef: Class<T, I1, S1>,
    orgClassRef: any,
    options: {
      pickKeys?: readonly PickKey[],
      omitKeys?: readonly OmitKey[],
      // partialKeys?: readonly PartialKey[],
      // requiredKeys?: readonly RequiredKey[],
      // readonlyKeys?: readonly ReadonlyKey[],
      // writableKey?: readonly WritableKey[],
    }
) {

  const pickKeys = options.pickKeys && options.pickKeys.map(x => String(x).toLowerCase());
  const omitKeys = options.omitKeys && options.omitKeys.map(x => String(x).toLowerCase());

  const isInheritedPredicate = (propertyName: string): boolean => {
    if (omitKeys && omitKeys.includes(propertyName.toLowerCase()))
      return false;
    if (pickKeys)
      return pickKeys.includes(propertyName.toLowerCase());
    return true;
  };

  // const isRequiredPredicate = (propertyName: string): boolean | undefined => {
  //   if (options.requiredKeys && options.requiredKeys.includes(propertyName as RequiredKey))
  //     return true;
  //   if (options.partialKeys && options.partialKeys.includes(propertyName as PartialKey))
  //     return false;
  //   return;
  // };

  class MappedClass {
    constructor() {
      inheritPropertyInitializers(this, classRef, isInheritedPredicate);
    }
  }

  applyMixins(MappedClass, classRef);

  const mappedTypeMetadata: any[] = [];
  const m = Reflect.getOwnMetadata(DATATYPE_METADATA, classRef);
  if (m) {
    if (!(m.kind === 'ComplexType'))
      throw new TypeError(`Class "${classRef}" is not a ComplexType`);
    const meta: any = {
      type: classRef
    };
    if (options.pickKeys)
      meta.pick = options.pickKeys;
    if (options.omitKeys)
      meta.omit = options.omitKeys;
    mappedTypeMetadata.push(meta);
  } else
    throw new TypeError(`Class "${classRef}" doesn't have datatype metadata information`);

  const SqbConnect = globalThis[optionalsSymbol]?.SqbConnect;
  if (SqbConnect) {
    const {Entity, EntityMetadata} = SqbConnect;
    const srcMeta = Entity.getMetadata(classRef);
    if (srcMeta) {
      const trgMeta = EntityMetadata.define(MappedClass);
      EntityMetadata.mixin(trgMeta, srcMeta, k => isInheritedPredicate(k));
    }
  }

  Reflect.defineMetadata(MAPPED_TYPE_METADATA, mappedTypeMetadata, MappedClass);
  return MappedClass as any;
}
