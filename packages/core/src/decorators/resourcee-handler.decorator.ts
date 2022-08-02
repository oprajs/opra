import "reflect-metadata";
import _ from 'lodash';
import { StrictOmit } from 'ts-gems';
import {
  RESOURCE_OPERATION,
  RESOURCE_OPERATION_METHODS,
} from '../constants';
import {
  ResourceListOperationMetadata,
  ResourceReadOperationMetadata
} from '../interfaces/opra-schema.metadata';


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
      kind: 'ResourceOperation',
      ...args,
      operation
    };
    Object.assign(meta, _.omit(args, Object.keys(meta)));
    Reflect.defineMetadata(RESOURCE_OPERATION, meta, target, propertyKey);
  }
}

