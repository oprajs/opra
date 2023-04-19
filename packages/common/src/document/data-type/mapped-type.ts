import { Class, StrictOmit, Type, Writable } from 'ts-gems';
import {
  applyMixins,
  inheritPropertyInitializers,
  omitUndefined,
  ResponsiveMap
} from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { METADATA_KEY } from '../constants.js';
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
    type: ComplexType;
  }

  export interface Options<T, K = keyof T> {
    pick?: readonly K[],
    omit?: readonly K[],
  }

  export interface Metadata extends StrictOmit<OpraSchema.MappedType, 'type'> {
    type: Type;
  }
}

/**
 * Type definition of MappedType prototype
 * @type MappedType
 */
export interface MappedType extends StrictOmit<DataType, 'own' | 'exportSchema'>,
    Pick<ComplexType, 'additionalFields' | 'fields'>, MappedType.OwnProperties {
  readonly own: MappedType.OwnProperties;
  readonly type: ComplexType;

  exportSchema(): OpraSchema.MappedType;
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
      source: Class<T, I1, S1>,
      options: {
        pickKeys?: readonly PickKey[],
        omitKeys?: readonly OmitKey[],
      }
  ): Class<T, Omit<Pick<I1, PickKey>, OmitKey>>;

  _applyMixin(target: Type, source: Type,
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
  let pickKeys: string[] | undefined;
  let omitKeys: string[] | undefined;
  const isInheritedPredicate = (propertyName: string): boolean => {
    if (omitKeys && omitKeys.includes(propertyName.toLowerCase()))
      return false;
    if (pickKeys)
      return pickKeys.includes(propertyName.toLowerCase());
    return true;
  };

  // MappedType helper
  if (!this) {
    const [source, options] = args as [Type, MappedType.Options<any>];
    pickKeys = options.pick && options.pick.map(x => String(x).toLowerCase());
    omitKeys = options.omit && options.omit.map(x => String(x).toLowerCase());

    class MappedClass {
      constructor() {
        inheritPropertyInitializers(this, source, isInheritedPredicate);
      }
    }

    applyMixins(MappedClass, source);

    // const mappedTypeMetadata: MappedType.TypeMapping[] = [];
    const m = Reflect.getOwnMetadata(METADATA_KEY, source) as OpraSchema.DataType;
    if (!m)
      throw new TypeError(`Class "${source}" doesn't have datatype metadata information`);
    if (!(m.kind === OpraSchema.ComplexType.Kind))
      throw new TypeError(`Class "${source}" is not a ${OpraSchema.ComplexType.Kind}`);

    const metadata: MappedType.Metadata = {
      kind: 'MappedType',
      type: source
    };
    if (options.pick)
      metadata.pick = options.pick as string[];
    if (options.omit)
      metadata.omit = options.omit as string[];
    Reflect.defineMetadata(METADATA_KEY, metadata, MappedClass);

    MappedType._applyMixin(MappedClass, source, {
      ...options,
      isInheritedPredicate
    });

    return MappedClass as any;
  }

  // Constructor
  // call super()
  DataType.apply(this, args);

  const [, init] = args as [never, MappedType.InitArguments];
  pickKeys = init.pick && init.pick.map(x => String(x).toLowerCase());
  omitKeys = init.omit && init.omit.map(x => String(x).toLowerCase());

  const _this = this as Writable<MappedType>;
  const own = _this.own as Writable<MappedType.OwnProperties>
  own.type = init.type;
  own.pick = init.pick;
  own.omit = init.omit;
  _this.kind = OpraSchema.MappedType.Kind;
  _this.type = own.type;
  _this.pick = own.pick;
  _this.omit = own.omit;
  _this.fields = new ResponsiveMap();
  _this.additionalFields = _this.type.additionalFields;
  for (const [elemName, elem] of own.type.fields.entries()) {
    if (isInheritedPredicate(elemName))
      _this.fields.set(elemName, elem);
  }
} as MappedTypeConstructor;

MappedType._applyMixin = () => void 0;

const proto = {

  exportSchema(): OpraSchema.MappedType {
    const out = DataType.prototype.exportSchema.call(this) as OpraSchema.MappedType;
    Object.assign(out, omitUndefined({
      type: this.own.type.name ? this.own.type.name : this.own.type.exportSchema(),
      pick: this.own.pick,
      omit: this.own.omit,
    }));
    return out;
  }

} as MappedType;

Object.assign(MappedType.prototype, proto);
Object.setPrototypeOf(MappedType.prototype, DataType.prototype);


export function PickType<T extends any[], I1, S1, K extends keyof I1>(
    classRef: Class<T, I1, S1>,
    keys: readonly K[]
): Class<T, Pick<I1, K>> &
    Omit<Pick<S1, keyof typeof classRef>, 'prototype' | 'constructor'> {
  return MappedType(classRef, {pick: keys} as any) as any;
}

export function OmitType<T extends any[], I1, S1, K extends keyof I1>(
    classRef: Class<T, I1, S1>, keys: readonly K[]
): Class<T, Omit<I1, K>> &
    Omit<Pick<S1, keyof typeof classRef>, 'prototype' | 'constructor'> {
  return MappedType(classRef, {omit: keys} as any) as any;
}
