import "reflect-metadata";
import _ from 'lodash';
import { StrictOmit } from 'ts-gems';
import { SCHEMA_PROPERTIES, SCHEMA_PROPERTY } from '../constants';
import { resolveClass } from '../helpers/class-utils.js';
import { OpraSchemaPropertyMetadata } from '../interfaces';

export function DtoProperty(
    args?: Partial<StrictOmit<OpraSchemaPropertyMetadata, 'name'>>
): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol): void => {
    if (typeof propertyKey !== 'string')
      throw new TypeError(`Symbol properties can't be used as Schema Property`);

    const resolvedType = args?.type
        ? resolveClass(args.type)
        : Reflect.getMetadata('design:type', target, propertyKey);

    const meta: OpraSchemaPropertyMetadata = {
      name: propertyKey,
      type: resolvedType
    }
    Object.assign(meta, _.omit(args, Object.keys(meta)));
    Reflect.defineMetadata(SCHEMA_PROPERTY, meta, target, propertyKey);

    const properties: string[] = Reflect.getMetadata(SCHEMA_PROPERTIES, target) || [];
    if (!properties.includes(propertyKey))
      properties.push(propertyKey);
    Reflect.defineMetadata(SCHEMA_PROPERTIES, properties, target);
  };

}
