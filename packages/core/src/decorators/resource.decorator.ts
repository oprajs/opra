import "reflect-metadata";
import _ from 'lodash';
import { StrictOmit } from 'ts-gems';
import {
  RESOURCE_METADATA, RESOURCE_OPERATION,
  RESOURCE_OPERATION_METHODS,
} from '../constants';
import {
  EntityResourceMetadata,
  ResourceListOperationMetadata,
  ResourceReadOperationMetadata
} from '../interfaces/opra-schema.metadata';
import { TypeThunkAsync } from '../types';

const NESTJS_INJECTABLE_WATERMARK = '__injectable__';

export function EntityResource(
    entityFunc: TypeThunkAsync,
    args?: StrictOmit<EntityResourceMetadata, 'kind' | 'type' | 'primaryKey'> & {
      key?: string | string[]
    }
) {
  return function (target: Function) {
    const meta: EntityResourceMetadata = {
      kind: 'EntityResource',
      type: entityFunc,
      primaryKey: args?.key || 'id',
      name: args?.name,
    };
    Object.assign(meta, _.omit(args, Object.keys(meta)));
    Reflect.defineMetadata(RESOURCE_METADATA, meta, target);

    /* Define Injectable metadata for NestJS support*/
    Reflect.defineMetadata(NESTJS_INJECTABLE_WATERMARK, true, target);
  }
}

export function ReadHandler(args?: StrictOmit<ResourceReadOperationMetadata, 'handle'>) {
  return createResourceOperationDecorator('read', args);
}

export function ListHandler(args?: StrictOmit<ResourceListOperationMetadata, 'handle'>) {
  return createResourceOperationDecorator('list', args);
}


function createResourceOperationDecorator(
    operation: string,
    args?: StrictOmit<ResourceListOperationMetadata, 'handle'>) {

  return function (target: Object,
                   propertyKey: string | symbol,
                   descriptor?: TypedPropertyDescriptor<any>
  ): TypedPropertyDescriptor<any> | void {
    /* istanbul ignore next */
    if (typeof propertyKey !== 'string')
      throw new TypeError('Symbol properties can not be used as api method');

    descriptor = descriptor || Object.getOwnPropertyDescriptor(target, propertyKey);
    if (!descriptor)
      throw new TypeError(`No property descriptor found for "${String(propertyKey)}"`);
    if (descriptor.value.name !== propertyKey)
      Object.defineProperty(descriptor.value, 'name', {
        value: propertyKey,
        enumerable: true,
        configurable: true,
        writable: true
      });

    const operationMethods = Reflect.getMetadata(RESOURCE_OPERATION_METHODS, target) || [];
    operationMethods.push(propertyKey);
    Reflect.defineMetadata(RESOURCE_OPERATION_METHODS, operationMethods, target);

    const meta = {
      ...args,
      operation
    };
    Object.assign(meta, _.omit(args, Object.keys(meta)));
    Reflect.defineMetadata(RESOURCE_OPERATION, meta, target, propertyKey);
  }
}

