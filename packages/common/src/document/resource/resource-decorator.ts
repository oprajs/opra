import omit from 'lodash.omit';
import merge from 'putil-merge';
import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { RESOURCE_METADATA } from '../constants.js';
import type { ApiAction } from './api-action.js';
import type { ApiOperation } from './api-operation.js';

/**
 * @namespace ResourceDecorator
 */
export namespace ResourceDecorator {

  export interface DecoratorMetadata extends StrictOmit<OpraSchema.ResourceBase, 'actions'> {
    name: string;
    actions?: Record<string, ApiAction.DecoratorMetadata>;
    operations?: Record<string, ApiOperation.DecoratorMetadata>;
  }

  export interface DecoratorOptions extends Partial<StrictOmit<DecoratorMetadata, 'kind' | 'actions' | 'operations'>> {
  }

}

export interface ResourceDecorator {
  Action: (options?: ResourceDecorator.DecoratorOptions) => ResourceDecorator;
}

export function ResourceDecorator<O extends ResourceDecorator.DecoratorOptions>(
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
    const metadata: ResourceDecorator.DecoratorMetadata = {kind, name};
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
