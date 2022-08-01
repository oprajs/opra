import _ from 'lodash';
import { StrictOmit } from 'ts-gems';
import { DTO_ENTITY_KEY, DTO_ENTITY_UNIQUE_KEYS, DTO_METADATA } from '../constants';
import { OpraSchema } from '../interfaces/opra-schema';
/*
export type EntityTypeMetadata =
    StrictOmit<OpraSchema.EntityType, 'base' | 'ctor' | 'properties'>;

export function EntityType(args?: Partial<EntityTypeMetadata>): ClassDecorator {
  return (target: Function): void => {
    const meta: EntityTypeMetadata = {
      kind: 'EntityType',
      name: args?.name || target.name,
    };
    Object.assign(meta, _.omit(args, Object.keys(meta)));
    Reflect.defineMetadata(DTO_METADATA, meta, target);
  };
}

export namespace EntityType {

  export function Key(properties: string | string[]): ClassDecorator
  export function Key(): PropertyDecorator
  export function Key(arg0?: any): ClassDecorator | PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
      // If Class decorator
      if (arguments.length === 1) {
        if (!arg0)
          throw new Error(`You must specify primary key property or properties`);
        const key = Array.isArray(arg0) ? arg0 : [arg0];
        Reflect.defineMetadata(DTO_ENTITY_KEY, key, target);
      } else {
        if (typeof propertyKey !== 'string')
          throw new TypeError(`Symbol properties can't be used as Model Property`);
        const metadata: string[] = Reflect.getMetadata(DTO_ENTITY_KEY, target.constructor) || [];
        if (!metadata.includes(propertyKey))
          metadata.push(propertyKey);
        Reflect.defineMetadata(DTO_ENTITY_KEY, metadata, target.constructor);
      }

    };
  }

  export function AdditionalKey(properties: string | string[]): ClassDecorator
  export function AdditionalKey(): PropertyDecorator
  export function AdditionalKey(arg0?: any): ClassDecorator | PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
      // If Class decorator
      if (arguments.length === 1) {
        if (!arg0)
          throw new Error(`You must specify primary key property or properties`);
        const metadata: string[][] = Reflect.getMetadata(DTO_ENTITY_UNIQUE_KEYS, target) || [];
        Reflect.defineMetadata(DTO_ENTITY_UNIQUE_KEYS, metadata, target);
        const key = Array.isArray(arg0) ? arg0 : [arg0];
        metadata.push(key);
      } else {
        if (typeof propertyKey !== 'string')
          throw new TypeError(`Symbol properties can't be used as Model Property`);
        const uniqueKeys: string[][] = Reflect.getMetadata(DTO_ENTITY_UNIQUE_KEYS, target.constructor) || [];
        Reflect.defineMetadata(DTO_ENTITY_UNIQUE_KEYS, uniqueKeys, target.constructor);
        uniqueKeys.push([propertyKey]);
      }

    };
  }

}
*/
