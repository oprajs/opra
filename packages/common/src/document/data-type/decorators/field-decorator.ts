import { omitUndefined } from '../../../helpers/index.js';
import { OpraSchema } from '../../../schema/index.js';
import { DATATYPE_METADATA } from '../../constants.js';
import type { ComplexType } from '../complex-type.js';
import type { ApiField } from '../field.js';

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
      designType
    }
    if (designType === Array) {
      elemMeta.isArray = true;
      delete elemMeta.designType;
    }
    Reflect.defineMetadata(DATATYPE_METADATA, omitUndefined(metadata), target.constructor);
  }
}
