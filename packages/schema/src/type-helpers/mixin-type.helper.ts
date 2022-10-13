import { Class, Type } from 'ts-gems';
import * as Optionals from '@opra/optionals';
import { DATATYPE_METADATA, MAPPED_TYPE_METADATA } from '../constants.js';
import { applyMixins, inheritPropertyInitializers } from './mixin.utils.js';

export function MixinType<A1 extends any[], I1, S1,
    A2 extends any[], I2, S2,
    A3 extends any[], I3, S3,
    A4 extends any[], I4, S4,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    >(c1: Class<A1, I1, S1>, c2: Class<A2, I2, S2>, c3?: Class<A3, I3, S3>, c4?: Class<A4, I4, S4>
): Class<any[], I1 & I2 & I3 & I4, S1 & S2 & S3 & S4> {
  const clasRefs = [...arguments].filter(x => !!x) as [Type];
  if (!clasRefs.length)
    throw new TypeError('You must provide base classeses');
  if (clasRefs.length === 1)
    return clasRefs[0] as any;

  class MappedClass {
    constructor() {
      for (const c of clasRefs)
        inheritPropertyInitializers(this, c);
    }
  }

  const mappedTypeMetadata: any[] = [];

  for (const c of clasRefs) {
    const m = Reflect.getOwnMetadata(DATATYPE_METADATA, c);
    if (m) {
      if (!(m.kind === 'ComplexType'))
        throw new TypeError(`Class "${c}" is not a ComplexType`);
      mappedTypeMetadata.push({
        type: c
      })
    } else if (Reflect.hasMetadata(MAPPED_TYPE_METADATA, c)) {
      const mtm = Reflect.getMetadata(MAPPED_TYPE_METADATA, c);
      if (mtm)
        mappedTypeMetadata.push(...mtm);
    } else
      throw new TypeError(`Class "${c}" doesn't have datatype metadata information`);
    applyMixins(MappedClass, c);
  }

  if (Optionals.SqbConnect) {
    const {Entity} = Optionals.SqbConnect;
    Entity.mixin(MappedClass, ...clasRefs);
  }

  Reflect.defineMetadata(MAPPED_TYPE_METADATA, mappedTypeMetadata, MappedClass);
  return MappedClass as any;
}


