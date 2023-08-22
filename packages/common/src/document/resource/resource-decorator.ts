import { RESOURCE_METADATA } from '../constants.js';
import type { Resource } from './resource.js';

export interface ResourceDecorator {
  Action: (options?: Resource.ActionOptions) => PropertyDecorator;
}


export const ResourceDecorator = {} as ResourceDecorator;

ResourceDecorator.Action = function (options): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol): void => {
    if (typeof propertyKey !== 'string')
      throw new TypeError(`This decorator can't be used for Symbol keys'`);
    const actionMeta = {...options};
    const resourceMetadata =
        (Reflect.getOwnMetadata(RESOURCE_METADATA, target.constructor) || {}) as Resource.Metadata;
    resourceMetadata.actions = resourceMetadata.actions || {};
    resourceMetadata.actions[propertyKey] = actionMeta;
    Reflect.defineMetadata(RESOURCE_METADATA, resourceMetadata, target.constructor);
  }
}
