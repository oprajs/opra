import _ from 'lodash';
import { COMPLEXTYPE_FIELDS } from '../constants.js';
import { FieldMetadata } from '../interfaces/metadata/data-type.metadata.js';

export function OprField(args?: Partial<FieldMetadata>): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol): void => {
    if (typeof propertyKey !== 'string')
      throw new TypeError(`Symbol properties can't be used as field`);

    const designType = Reflect.getMetadata('design:type', target, propertyKey);
    if (designType === Array && !args?.type)
      throw new TypeError(`You must provide exact "type". Resolving type information of an Array is not possible with reflection`);
    if (designType !== Array && args?.isArray)
      throw new TypeError(`Design type is not an array but you provide "isArray" option. This might be a mistake.`);

    const metadata: FieldMetadata = {
      type: args?.type || designType
    }
    if (designType === Array)
      metadata.isArray = true;

    Object.assign(metadata, _.omit(args, Object.keys(metadata)));

    const fields = Reflect.getOwnMetadata(COMPLEXTYPE_FIELDS, target.constructor) || {};
    fields[propertyKey] = metadata;
    Reflect.defineMetadata(COMPLEXTYPE_FIELDS, fields, target.constructor);
  };
}
