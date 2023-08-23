import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { DATATYPE_METADATA } from '../constants.js';
import type { ComplexType } from './complex-type.js';
import { EnumType } from './enum-type.js';
import type { ApiField } from './field.js';

export interface FieldDecorator {
  (options?: ApiField.DecoratorOptions): PropertyDecorator;
}

export function FieldDecorator(options?: ApiField.DecoratorOptions): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol) {
    if (typeof propertyKey !== 'string')
      throw new TypeError(`Symbol properties can't be used as a field`);

    const metadata: ComplexType.Metadata = Reflect.getOwnMetadata(DATATYPE_METADATA, target.constructor) || ({} as any);
    metadata.kind = OpraSchema.ComplexType.Kind;
    metadata.fields = metadata.fields || {};

    const designType = Reflect.getMetadata('design:type', target, propertyKey);
    const elemMeta: ApiField.Metadata = metadata.fields[propertyKey] = {
      ...options,
      enum: undefined,
      designType
    }
    if (designType === Array) {
      elemMeta.isArray = true;
      delete elemMeta.designType;
    }

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
        const m = Reflect.getOwnMetadata(DATATYPE_METADATA, options?.enum);
        if (!OpraSchema.isEnumType(m))
          throw new TypeError(`Invalid "enum" value. Did you forget to set metadata using EnumType() method?`);
        elemMeta.enum = options.enum;
      }
    }
    Reflect.defineMetadata(DATATYPE_METADATA, omitUndefined(metadata), target.constructor);
  }
}
