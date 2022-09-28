import _ from 'lodash';
import { COMPLEXTYPE_FIELDS } from '../constants.js';
import { FieldMetadata } from '../interfaces/metadata/data-type.metadata.js';

export function OprField(args?: Partial<FieldMetadata>): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol): void => {
    if (typeof propertyKey !== 'string')
      throw new TypeError(`Symbol properties can't be used as field`);

    const designType = Reflect.getMetadata('design:type', target, propertyKey);

    const metadata: FieldMetadata = {
      type: args?.type || designType
    }
    Object.assign(metadata, _.omit(args, Object.keys(metadata)));

    const fields = Reflect.getOwnMetadata(COMPLEXTYPE_FIELDS, target.constructor) || {};
    fields[propertyKey] = metadata;
    Reflect.defineMetadata(COMPLEXTYPE_FIELDS, fields, target.constructor);
  };
}
