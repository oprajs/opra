import "reflect-metadata";
import { omit } from 'lodash';
import { StrictOmit } from 'ts-gems';
import { RESOURCE_METADATA } from '../constants.js';
import { SingletonResourceMetadata } from '../interfaces/resource.metadata.js';
import { TypeThunkAsync } from '../types.js';

const NESTJS_INJECTABLE_WATERMARK = '__injectable__';

export type SingletonResourceOptions = StrictOmit<SingletonResourceMetadata,
    'name' | 'kind' | 'type' | 'instance' | 'create' | 'get' | 'update' | 'delete'> & {
  name?: string;
};

const NAME_PATTERN = /^(.*)Resource$/;

export function OprSingletonResource(
    type: TypeThunkAsync | string,
    options?: SingletonResourceOptions
) {
  return function (target: Function) {
    const name = options?.name || target.name.match(NAME_PATTERN)?.[1] || target.name;
    const meta: SingletonResourceMetadata = {
      kind: 'SingletonResource',
      type,
      name
    };
    Object.assign(meta, omit(options, Object.keys(meta)));
    Reflect.defineMetadata(RESOURCE_METADATA, meta, target);

    /* Define Injectable metadata for NestJS support*/
    Reflect.defineMetadata(NESTJS_INJECTABLE_WATERMARK, true, target);
  }
}

