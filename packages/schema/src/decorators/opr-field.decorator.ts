import _ from 'lodash';
import { StrictOmit } from 'ts-gems';
import { COMPLEXTYPE_FIELDS } from '../constants.js';
import { FieldMetadata } from '../interfaces/metadata/data-type.metadata.js';

export function OprField(args?: Partial<StrictOmit<FieldMetadata, 'isArray'>>): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol): void => {
    if (typeof propertyKey !== 'string')
      throw new TypeError(`Symbol properties can't be used as field`);

    const designType = Reflect.getMetadata('design:type', target, propertyKey);

    const metadata: FieldMetadata = {
      type: args?.type
    }
    Object.assign(metadata, _.omit(args, Object.keys(metadata)));

    if (designType === Array) {
      metadata.isArray = true;
      metadata.type = metadata.type || 'any';
    } else {
      delete metadata.isArray;
      metadata.type = metadata.type || designType;
    }

    const fields = Reflect.getOwnMetadata(COMPLEXTYPE_FIELDS, target.constructor) || {};
    fields[propertyKey] = metadata;
    Reflect.defineMetadata(COMPLEXTYPE_FIELDS, fields, target.constructor);
  };
}
