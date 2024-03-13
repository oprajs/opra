import 'reflect-metadata';
import merge from 'putil-merge';
import { Class, StrictOmit, Type } from 'ts-gems';
import { inheritPropertyInitializers, mergePrototype, } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiNode } from '../api-node';
import { DATATYPE_METADATA } from '../constants.js';
import { ComplexType } from './complex-type.js';
import { MappedType } from './mapped-type.js';
import { MixinTypeClass } from './mixin-type-class.js';


/**
 * Type definition of MixinType constructor type
 * @type MixinTypeConstructor
 */
export interface MixinTypeConstructor {
  prototype: MixinType;

  new(node: ApiNode, init: MixinType.InitArguments): MixinType;

  <A1 extends any[], I1, S1,
      A2 extends any[], I2, S2,
      A3 extends any[], I3, S3,
      A4 extends any[], I4, S4,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
  >(
      c1: Class<A1, I1, S1>,
      c2: Class<A2, I2, S2>,
      c3?: Class<A3, I3, S3>,
      c4?: Class<A4, I4, S4>
  ): Class<any[], I1 & I2 & I3 & I4, S1 & S2 & S3 & S4>;

  _applyMixin(target: Type, ...sources: [Type]): void;
}

/**
 * Type definition of MixinType prototype
 * @type MixinType
 */
export interface MixinType extends MixinTypeClass {
}


/**
 * @class MixinType
 */
export const MixinType = function (
    this: MixinType,
    ...args: any[]
) {

  // Constructor
  if (this) {
    const [node, init] = args as [ApiNode, MixinType.InitArguments];
    merge(this, new MixinTypeClass(node, init), {descriptor: true});
    return;
  }

  // MixinType helper

  // Filter undefined items
  const clasRefs = [...args].filter(x => !!x) as [Type];
  if (!clasRefs.length)
    throw new TypeError('No Class has been provided');
  if (clasRefs.length === 1)
    return clasRefs[0] as any;

  class MixinClass {
    constructor() {
      for (const c of clasRefs)
        inheritPropertyInitializers(this, c);
    }
  }

  const metadata: MixinType.Metadata = {
    kind: OpraSchema.MixinType.Kind,
    types: []
  };
  Reflect.defineMetadata(DATATYPE_METADATA, metadata, MixinClass);

  for (const c of clasRefs) {
    const itemMeta = Reflect.getMetadata(DATATYPE_METADATA, c);
    if (!(itemMeta && (itemMeta.kind === OpraSchema.ComplexType.Kind || itemMeta.kind === OpraSchema.MixinType.Kind ||
        itemMeta.kind === OpraSchema.MappedType.Kind)))
      throw new TypeError(`Class "${c.name}" is not a ${OpraSchema.ComplexType.Kind}, ${OpraSchema.MixinType.Kind} or ${OpraSchema.MappedType.Kind}`);
    metadata.types.push(c);
    mergePrototype(MixinType.prototype, c.prototype);
  }

  MixinType._applyMixin(MixinClass, ...clasRefs);

  return MixinClass as any;
} as MixinTypeConstructor;

MixinType.prototype = MixinTypeClass.prototype;
MixinType._applyMixin = () => void 0;


/**
 * @namespace MixinType
 */
export namespace MixinType {

  export interface InitArguments extends ComplexType.InitArguments {
    types: (ComplexType | MixinType | MappedType)[]
  }

  export interface Metadata extends StrictOmit<ComplexType.Metadata, 'kind' | 'base' | 'name'> {
    kind: OpraSchema.MixinType.Kind;
    base?: Type;
    types: Type[];
  }

  export interface OwnProperties extends ComplexType.OwnProperties {
    types: (ComplexType | MixinType | MappedType)[];
  }

}
