import "reflect-metadata";
import _ from 'lodash';
import {
  RESOURCE_OPERATION,
  RESOURCE_OPERATION_METHODS, RESOURCE_OPERATION_TYPE,
} from '../constants.js';
import {
  ResourceCreateOperationMetadata,
  ResourceDeleteOperationMetadata,
  ResourceExecuteOperationMetadata,
  ResourcePatchOperationMetadata,
  ResourceReadOperationMetadata,
  ResourceSearchOperationMetadata,
  ResourceUpdateOperationMetadata
} from '../interfaces/opra-schema.metadata.js';


export type ReadOperationOptions = ResourceReadOperationMetadata;
export type SearchOperationOptions = ResourceSearchOperationMetadata;
export type CreateOperationOptions = ResourceCreateOperationMetadata;
export type UpdateOperationOptions = ResourceUpdateOperationMetadata;
export type PatchOperationOptions = ResourcePatchOperationMetadata;
export type DeleteOperationOptions = ResourceDeleteOperationMetadata;
export type ExecuteOperationOptions = ResourceExecuteOperationMetadata;

export function ReadOperation(args?: ReadOperationOptions) {
  return createResourceOperationDecorator('read', args);
}

export function SearchOperation(args?: SearchOperationOptions) {
  return createResourceOperationDecorator('search', args);
}

export function CreateOperation(args?: CreateOperationOptions) {
  return createResourceOperationDecorator('create', args);
}

export function UpdateOperation(args?: UpdateOperationOptions) {
  return createResourceOperationDecorator('update', args);
}

export function PatchOperation(args?: PatchOperationOptions) {
  return createResourceOperationDecorator('patch', args);
}

export function DeleteOperation(args?: DeleteOperationOptions) {
  return createResourceOperationDecorator('delete', args);
}

export function ExecuteOperation(args?: ExecuteOperationOptions) {
  return createResourceOperationDecorator('execute', args);
}


function createResourceOperationDecorator<TMetadata>(operationType: string, args: TMetadata) {

  return function (target: Object,
                   propertyKey: string | symbol,
                   descriptor?: TypedPropertyDescriptor<any>
  ): TypedPropertyDescriptor<any> | void {
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

    Reflect.defineMetadata(RESOURCE_OPERATION_TYPE, operationType, target, propertyKey);

    const meta: TMetadata = {
      ...args,
    };
    Object.assign(meta, _.omit(args as any, Object.keys(meta)));
    Reflect.defineMetadata(RESOURCE_OPERATION, meta, target, propertyKey);

    const operationMethods: string[] = Reflect.getMetadata(RESOURCE_OPERATION_METHODS, target) || [];
    if (!operationMethods.includes(propertyKey))
      operationMethods.push(propertyKey);
    Reflect.defineMetadata(RESOURCE_OPERATION_METHODS, operationMethods, target, propertyKey);

  }
}

