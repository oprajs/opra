import "reflect-metadata";
import _ from 'lodash';
import { RESOURCE_METADATA } from '../constants.js';
import { EntityResourceMetadata } from '../interfaces/opra-schema.metadata.js';
import { TypeThunkAsync } from '../types.js';

const NESTJS_INJECTABLE_WATERMARK = '__injectable__';

export type EntityResourceOptions = Pick<EntityResourceMetadata, 'name' | 'description'> & {
  primaryKey?: string | string[]
}

const NAME_PATTERN = /^(.*)Resource$/;

export function EntityResource(
    entityFunc: TypeThunkAsync,
    options?: EntityResourceOptions
) {
  return function (target: Function) {
    const name = options?.name || target.name.match(NAME_PATTERN)?.[1] || target.name;
    const meta: EntityResourceMetadata = {
      kind: 'EntityResource',
      type: entityFunc,
      primaryKey: options?.primaryKey || 'id',
      name
    };
    Object.assign(meta, _.omit(options, Object.keys(meta)));
    Reflect.defineMetadata(RESOURCE_METADATA, meta, target);

    /* Define Injectable metadata for NestJS support*/
    Reflect.defineMetadata(NESTJS_INJECTABLE_WATERMARK, true, target);
  }
}

