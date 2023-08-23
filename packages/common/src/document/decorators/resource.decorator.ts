import omit from 'lodash.omit';
import merge from 'putil-merge';
import { OpraSchema } from '../../schema/index.js';
import { RESOURCE_METADATA } from '../constants.js';
import type { Resource } from '../resource/resource';

export interface ResourceDecorator {
  Action: (options?: Resource.ActionOptions) => PropertyDecorator;
}

export function ResourceDecorator<O extends Resource.DecoratorOptions>(kind: OpraSchema.Resource.Kind, options?: O): ClassDecorator {
  const namePattern = new RegExp(`^(.*)(${kind}|Resource|Controller)$`);
  return function (target: Function) {
    const name = options?.name || namePattern.exec(target.name)?.[1] || target.name;
    const metadata: Resource.Metadata = {kind, name};
    const baseMetadata = Reflect.getOwnMetadata(RESOURCE_METADATA, Object.getPrototypeOf(target));
    if (baseMetadata)
      merge(metadata, baseMetadata, {deep: true});
    const oldMetadata: Resource.Metadata = Reflect.getOwnMetadata(RESOURCE_METADATA, target);
    if (oldMetadata)
      merge(metadata, oldMetadata, {deep: true});
    merge(metadata, {
      kind,
      name,
      ...omit(options, ['kind', 'name', 'controller'])
    }, {deep: true});
    Reflect.defineMetadata(RESOURCE_METADATA, metadata, target);
  }
}


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
