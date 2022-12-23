import "reflect-metadata";
import _ from 'lodash';
import { PartialSome, StrictOmit } from 'ts-gems';
import { RESOURCE_METADATA } from '../constants.js';
import { CollectionResourceMetadata } from '../interfaces/resource.metadata.js';
import { TypeThunkAsync } from '../types.js';

const NESTJS_INJECTABLE_WATERMARK = '__injectable__';

export type CollectionResourceOptions = PartialSome<StrictOmit<CollectionResourceMetadata,
    'name' | 'kind' | 'type' | 'instance' |
    'create' | 'count' | 'get' | 'update' | 'updateMany' | 'delete' | 'deleteMany' | 'search'>,
    'keyFields'> & {
  name?: string;
};

const NAME_PATTERN = /^(.*)Resource$/;

export function OprCollectionResource(
    entityFunc: TypeThunkAsync,
    options?: CollectionResourceOptions
) {
  return function (target: Function) {
    const name = options?.name || target.name.match(NAME_PATTERN)?.[1] || target.name;
    const meta: CollectionResourceMetadata = {
      kind: 'CollectionResource',
      type: entityFunc,
      name
    };
    Object.assign(meta, _.omit(options, Object.keys(meta)));
    Reflect.defineMetadata(RESOURCE_METADATA, meta, target);

    /* Define Injectable metadata for NestJS support*/
    Reflect.defineMetadata(NESTJS_INJECTABLE_WATERMARK, true, target);
  }
}

