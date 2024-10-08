import { OpraSchema } from '../../schema/index.js';
import { DATATYPE_METADATA } from '../constants.js';
import type { ApiField } from '../data-type/api-field.js';
import type { ComplexType } from '../data-type/complex-type.js';

export interface ApiFieldDecorator {
  (options?: ApiField.Options): PropertyDecorator;
}

export function ApiFieldDecorator(options?: ApiField.Options): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol) {
    if (typeof propertyKey !== 'string') throw new TypeError(`Symbol properties can't be used as a field`);

    const metadata: ComplexType.Metadata = Reflect.getOwnMetadata(DATATYPE_METADATA, target.constructor) || ({} as any);
    metadata.kind = OpraSchema.ComplexType.Kind;
    metadata.fields = metadata.fields || {};

    const designType = Reflect.getMetadata('design:type', target, propertyKey);
    const elemMeta: ApiField.Metadata = (metadata.fields[propertyKey] = {
      ...options,
    });
    if (designType === Array) {
      elemMeta.isArray = true;
    } else elemMeta.type = elemMeta.type || designType;
    Reflect.defineMetadata(DATATYPE_METADATA, metadata, target.constructor);
  };
}
