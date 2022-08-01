import _ from 'lodash';
import { StrictOmit, Type } from 'ts-gems';
import { DTO_PROPERTIES } from '../constants';
import { OpraSchema } from '../interfaces/opra-schema';
import { TypeThunk } from '../types';
import { resolveClass } from '../utils/class-utils';

export type PropertyMetadata =
    StrictOmit<OpraSchema.Property, 'type'> &
    {
      type?: string | TypeThunk;
    }

export function Property(args?: Partial<PropertyMetadata>): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol): void => {
    if (typeof propertyKey !== 'string')
      throw new TypeError(`Symbol properties can't be used as Model Property`);

    let resolvedType: string | Type;
    if (args?.type) {
      resolvedType = typeof args.type === 'string'
          ? args.type
          : resolveClass(args.type);
    } else {
      resolvedType = Reflect.getMetadata('design:type', target, propertyKey) || 'string';
    }

    const metadata: PropertyMetadata = {
      name: propertyKey,
      type: resolvedType
    }
    Object.assign(metadata, _.omit(args, Object.keys(metadata)));

    const properties = Reflect.getOwnMetadata(DTO_PROPERTIES, target) || {};
    properties[propertyKey] = metadata;
    Reflect.defineMetadata(DTO_PROPERTIES, properties, target);
  };
}
