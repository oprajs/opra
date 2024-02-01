import omit from 'lodash.omit';
import merge from 'putil-merge';
import { OpraSchema } from '../../schema/index.js';
import { RESOURCE_METADATA } from '../constants.js';
import type { ApiResource } from './api-resource.js';

export interface ResourceDecorator {
  Action: (options?: ApiResource.DecoratorOptions) => ResourceDecorator;
}

export function ResourceDecorator<O extends ApiResource.DecoratorOptions>(
    kind: OpraSchema.Resource.Kind,
    meta?: O
): ClassDecorator {
  const namePattern = new RegExp(`^(.*)(${kind}|Resource|Controller)$`);
  return function (target: Function) {
    let name = meta?.name;
    if (!name) {
      name = namePattern.exec(target.name)?.[1] || target.name;
      // Containers may start with lowercase
      if (kind === 'Container')
        name = name.charAt(0).toLowerCase() + name.substring(1);
    }
    const metadata: ApiResource.DecoratorMetadata = {kind, name};
    const baseMetadata = Reflect.getOwnMetadata(RESOURCE_METADATA, Object.getPrototypeOf(target));
    if (baseMetadata)
      merge(metadata, baseMetadata, {deep: true});
    const oldMetadata = Reflect.getOwnMetadata(RESOURCE_METADATA, target);
    if (oldMetadata)
      merge(metadata, oldMetadata, {deep: true});
    merge(metadata, {
      kind,
      name,
      ...omit(meta, ['kind', 'name', 'controller'])
    }, {deep: true});
    Reflect.defineMetadata(RESOURCE_METADATA, metadata, target);
  }
}
