import "reflect-metadata";
import _ from 'lodash';
import { StrictOmit } from 'ts-gems';
import { NESTJS_INJECTABLE_WATERMARK, RESOURCE_METADATA } from '../constants';
import { resolveClass } from '../helpers/class-utils';
import { OpraCollectionResourceMetadata } from '../interfaces';
import { TypeThunk } from '../types';

export function ApiCollection(
    entityFunc: TypeThunk,
    args?: StrictOmit<OpraCollectionResourceMetadata, 'resourceKind' | 'entityCtor'>
) {
  return function (target: Function) {
    const entityCtor = resolveClass(entityFunc);

    const meta: OpraCollectionResourceMetadata = {
      resourceKind: 'collection',
      name: args?.name || entityCtor.name,
      entityCtor
    };
    Object.assign(meta, _.omit(args, Object.keys(meta)));
    Reflect.defineMetadata(RESOURCE_METADATA, meta, target);

    /* Define Injectable metadata for NestJS support*/
    Reflect.defineMetadata(NESTJS_INJECTABLE_WATERMARK, true, target);
  }
}
