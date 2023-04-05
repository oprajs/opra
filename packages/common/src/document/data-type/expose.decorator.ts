import { StrictOmit, Type } from 'ts-gems';
import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { METADATA_KEY } from '../constants.js';
import type { ComplexType } from './complex-type.js';
import { EnumType } from './enum-type.js';

export namespace Expose {

  export interface Options extends Partial<StrictOmit<OpraSchema.ComplexType.Element, 'isArray' | 'type'>> {
    type?: string | OpraSchema.DataType | Type;
    enum?: OpraSchema.EnumObject | string[];
  }

  export interface Metadata extends StrictOmit<OpraSchema.ComplexType.Element, 'type'> {
    type?: string | OpraSchema.DataType | Type;
    enum?: OpraSchema.EnumObject;
    designType?: Type;
  }
}

export function Expose(options?: Expose.Options): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol) {
    if (typeof propertyKey !== 'string')
      throw new TypeError(`Symbol properties can't be used as element`);

    const metadata: ComplexType.Metadata = Reflect.getOwnMetadata(METADATA_KEY, target.constructor) || ({} as any);
    metadata.kind = OpraSchema.ComplexType.Kind;
    metadata.elements = metadata.elements || {};

    const designType = Reflect.getMetadata('design:type', target, propertyKey);
    const isArray = designType === Array;
    const elemMeta: Expose.Metadata = metadata.elements[propertyKey] = {
      ...options,
      enum: undefined,
      designType: isArray ? undefined : designType
    }
    if (designType === Array)
      elemMeta.isArray = true;
    if (options?.enum) {
      elemMeta.type = undefined;
      if (Array.isArray(options.enum)) {
        const enumObj = options.enum.reduce((o, v) => {
          o[v] = v;
          return o;
        }, {});
        EnumType(enumObj);
        elemMeta.enum = enumObj;
      } else {
        const m = Reflect.getOwnMetadata(METADATA_KEY, options?.enum);
        if (!OpraSchema.isEnumType(m))
          throw new TypeError(`Invalid "enum" value. Did you forget to set metadata using EnumType() method?`);
        elemMeta.enum = options.enum;
      }
    }
    Reflect.defineMetadata(METADATA_KEY, omitUndefined(metadata), target.constructor);
  }
}
