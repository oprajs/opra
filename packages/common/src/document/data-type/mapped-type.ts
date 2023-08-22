import 'reflect-metadata';
import merge from 'putil-merge';
import { Class, StrictOmit, Type, Writable } from 'ts-gems';
import * as vg from 'valgen';
import {
  inheritPropertyInitializers,
  mergePrototype,
  omitUndefined,
  ResponsiveMap
} from '../../helpers/index.js';
import { Field } from '../../schema/data-type/field.interface.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { DATATYPE_METADATA } from '../constants.js';
import { ApiField } from './api-field.js';
import { ComplexType } from './complex-type.js';
import { DataType } from './data-type.js';

/**
 * @namespace MappedType
 */
export namespace MappedType {

  export interface InitArguments extends DataType.InitArguments,
      Pick<OpraSchema.MappedType, 'pick' | 'omit'> {
    type: ComplexType;
  }

  export interface OwnProperties extends DataType.OwnProperties,
      Pick<OpraSchema.MappedType, 'pick' | 'omit'> {
  }

  export interface Options<T, K = keyof T> {
    pick?: readonly K[],
    omit?: readonly K[],
  }

  export interface Metadata extends StrictOmit<OpraSchema.MappedType, 'type'> {
    type: Type;
  }
}

class MappedTypeClass extends DataType {
  readonly kind = OpraSchema.MappedType.Kind;
  readonly own: MappedType.OwnProperties;
  readonly type: ComplexType;
  readonly additionalFields?: boolean | vg.Validator | 'error';
  readonly fields: ResponsiveMap<ApiField>;
  readonly omit?: Field.Name[];
  readonly pick?: Field.Name[];

  constructor(document: ApiDocument, init: MappedType.InitArguments) {
    super(document, init);
    const own = this.own as Writable<MappedType.OwnProperties>
    own.pick = init.pick;
    own.omit = init.omit;
    this.kind = OpraSchema.MappedType.Kind;
    this.type = init.type;
    this.pick = own.pick;
    this.omit = own.omit;
    this.fields = new ResponsiveMap();
    this.additionalFields = this.type.additionalFields;
    const isInheritedPredicate = getIsInheritedPredicateFn(init.pick, init.omit);
    for (const [elemName, elem] of this.type.fields.entries()) {
      if (isInheritedPredicate(elemName))
        this.fields.set(elemName, elem);
    }
  }

  exportSchema(): OpraSchema.MappedType {
    const out = DataType.prototype.exportSchema.call(this) as OpraSchema.MappedType;
    Object.assign(out, omitUndefined({
      type: this.type.name ? this.type.name : this.type.exportSchema(),
      pick: this.own.pick,
      omit: this.own.omit,
    }));
    return out;
  }

}

/**
 * Type definition of MappedType prototype
 * @type MappedType
 */
export interface MappedType extends MappedTypeClass {

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
    type: mappedSource
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


function getIsInheritedPredicateFn(pick?: Field.Name[], omit?: Field.Name[]) {
  const pickKeys = pick?.map(x => String(x).toLowerCase());
  const omitKeys = omit?.map(x => String(x).toLowerCase());
  return (propertyName: string): boolean => {
    if (omitKeys && omitKeys.includes(propertyName.toLowerCase()))
      return false;
    if (pickKeys)
      return pickKeys.includes(propertyName.toLowerCase());
    return true;
  };
}

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
