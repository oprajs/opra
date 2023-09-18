import omit from 'lodash.omit';
import merge from 'putil-merge';
import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { TypeThunkAsync } from '../../types.js';
import { RESOURCE_METADATA } from '../constants.js';
import { EnumType } from '../data-type/enum-type.js';

export interface ResourceDecorator {
  Action: (options?: ResourceDecorator.EndpointOptions) => ResourceDecorator;
}

export function ResourceDecorator<O extends ResourceDecorator.Options>(kind: OpraSchema.Resource.Kind, meta?: O): ClassDecorator {
  const namePattern = new RegExp(`^(.*)(${kind}|Resource|Controller)$`);
  return function (target: Function) {
    const name = meta?.name || namePattern.exec(target.name)?.[1] || target.name;
    const metadata: ResourceDecorator.Metadata = {kind, name};
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

/**
 * @namespace ResourceDecorator
 */
export namespace ResourceDecorator {

  export interface Metadata extends StrictOmit<OpraSchema.ResourceBase, 'actions' | 'operations'> {
    name: string;
    actions?: Record<string, EndpointMetadata>;
    operations?: Record<string, EndpointMetadata>;
  }

  export interface Options extends Partial<StrictOmit<Metadata, 'kind' | 'actions' | 'operations'>> {
  }

  export interface ParameterMetadata extends StrictOmit<OpraSchema.Endpoint.Parameter, 'type'> {
    type?: TypeThunkAsync | string;
    enum?: EnumType.EnumObject | EnumType.EnumArray;
  }

  export interface ParameterOptions extends Partial<ParameterMetadata> {
  }

  export interface EndpointMetadata extends StrictOmit<OpraSchema.Endpoint, 'parameters'> {
    parameters: Record<string, ParameterMetadata>;
  }

  export interface EndpointOptions extends Partial<StrictOmit<EndpointMetadata, 'parameters'>> {
    parameters?: Record<string, ParameterOptions>;
  }

}
