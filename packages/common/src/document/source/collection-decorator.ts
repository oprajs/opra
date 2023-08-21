import omit from 'lodash.omit';
import merge from 'putil-merge';
import { Type } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { METADATA_KEY } from '../constants.js';
import type { Collection } from './collection.js';

// todo, put this in nextjs package wia augmentation
const NESTJS_INJECTABLE_WATERMARK = '__injectable__';
const NAME_PATTERN = /^(.*)(Source|Resource|Collection|Controller)$/;

export interface CollectionDecorator {
  <T>(type: Type<T> | string, options?: Collection.DecoratorOptions<T>): ClassDecorator;

  Create: (options?: Collection.CreateEndpointOptions) => ((target: Object, propertyKey: 'create') => void);
  Delete: (options?: Collection.DeleteEndpointOptions) => ((target: Object, propertyKey: 'delete') => void);
  DeleteMany: (options?: Collection.DeleteManyEndpointOptions) => ((target: Object, propertyKey: 'deleteMany') => void);
  Get: (options?: Collection.GetEndpointOptions) => ((target: Object, propertyKey: 'get') => void);
  FindMany: (options?: Collection.FindManyEndpointOptions) => ((target: Object, propertyKey: 'findMany') => void);
  Update: (options?: Collection.UpdateEndpointOptions) => ((target: Object, propertyKey: 'update') => void);
  UpdateMany: (options?: Collection.UpdateManyEndpointOptions) => ((target: Object, propertyKey: 'updateMany') => void);
}

export function CollectionDecorator(type: Type | string, options?: Collection.DecoratorOptions): ClassDecorator {
  return function (target: Function) {
    const name = options?.name || target.name.match(NAME_PATTERN)?.[1] || target.name;
    const metadata: Collection.Metadata = Reflect.getOwnMetadata(METADATA_KEY, target) || ({} as any);
    const baseMetadata = Reflect.getOwnMetadata(METADATA_KEY, Object.getPrototypeOf(target));
    if (baseMetadata) {
      merge(metadata, baseMetadata, {deep: true});
    }
    metadata.kind = OpraSchema.Collection.Kind;
    metadata.name = name;
    metadata.type = type;
    // Merge with previous metadata object
    const m = Reflect.getMetadata(METADATA_KEY, target);
    if (m && metadata !== m)
      Object.assign(metadata, omit(m), Object.keys(metadata));
    // Merge options
    if (options)
      Object.assign(metadata, omit(options, ['kind', 'name', 'type', 'controller']));
    Reflect.defineMetadata(METADATA_KEY, metadata, target);

    /* Define Injectable metadata for NestJS support*/
    Reflect.defineMetadata(NESTJS_INJECTABLE_WATERMARK, true, target);
  }
}


CollectionDecorator.Create = createOperationDecorator('create');
CollectionDecorator.Delete = createOperationDecorator('delete');
CollectionDecorator.DeleteMany = createOperationDecorator('deleteMany');
CollectionDecorator.Get = createOperationDecorator('get');
CollectionDecorator.FindMany = createOperationDecorator('findMany');
CollectionDecorator.Update = createOperationDecorator('update');
CollectionDecorator.UpdateMany = createOperationDecorator('updateMany');


function createOperationDecorator<T>(operation: string) {
  return (options?: T) =>
      ((target: Object, propertyKey: string | symbol): void => {
        if (propertyKey !== operation)
          throw new TypeError(`Name of the handler name should be '${operation}'`);
        const operationMeta = {...options};
        const sourceMetadata =
            (Reflect.getOwnMetadata(METADATA_KEY, target.constructor) || {}) as Collection.Metadata;
        sourceMetadata.operations = sourceMetadata.operations || {};
        sourceMetadata.operations[operation] = operationMeta;
        Reflect.defineMetadata(METADATA_KEY, sourceMetadata, target.constructor);
      });
}
