import 'reflect-metadata';
import _ from 'lodash';
import { StrictOmit, Type } from 'ts-gems';
import {
  DTO_ENTITY_KEY,
  DTO_ENTITY_UNIQUE_KEYS,
  DTO_METADATA,
  DTO_PROPERTIES} from '@opra/core/src/constants';
import { OpraSchema } from '../interfaces/opra-schema';
import { TypeThunk } from '../types';
import { resolveClass } from '../utils/class-utils';

export namespace Dto {

  export type ComplexTypeMetadata =
      StrictOmit<OpraSchema.ComplexType, 'ctor' | 'properties'>;

  export type EntityTypeMetadata =
      StrictOmit<OpraSchema.EntityType, 'ctor' | 'properties'>;

  export type PropertyMetadata =
      StrictOmit<OpraSchema.Property, 'type'> &
      {
        type?: string | TypeThunk;
      }


  export function ComplexType(args?: Partial<ComplexTypeMetadata>): ClassDecorator {
    return (target: Function): void => {
      const meta: ComplexTypeMetadata = {
        kind: 'ComplexType',
        name: args?.name || target.name,
      };
      Object.assign(meta, _.omit(args, Object.keys(meta)));
      Reflect.defineMetadata(DTO_METADATA, meta, target);
    };
  }

  export function Entity(args?: Partial<EntityTypeMetadata>): ClassDecorator {
    return (target: Function): void => {
      const meta: EntityTypeMetadata = {
        kind: 'EntityType',
        name: args?.name || target.name,
      };
      Object.assign(meta, _.omit(args, Object.keys(meta)));
      Reflect.defineMetadata(DTO_METADATA, meta, target);
    };
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
        type: resolvedType
      }
      Object.assign(metadata, _.omit(args, Object.keys(metadata)));

      const properties = Reflect.getMetadata(DTO_PROPERTIES, target) || {};
      properties[propertyKey] = metadata;
      Reflect.defineMetadata(DTO_PROPERTIES, properties, target);
    };
  }

  export namespace Entity {

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

    export function Unique(properties: string | string[]): ClassDecorator
    export function Unique(): PropertyDecorator
    export function Unique(arg0?: any): ClassDecorator | PropertyDecorator {
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


}
