import isNil from 'lodash.isnil';
import omitBy from 'lodash.omitby';
import { Collection, Singleton } from '@opra/common';
import { Request } from '@opra/core';
import { EntityMetadata } from '@sqb/connect';
import _transformFilter from './transform-filter.js';
import _transformKeyValues from './transform-key-values.js';

export namespace SQBAdapter {

  export const transformFilter = _transformFilter;
  export const transformKeyValues = _transformKeyValues;

  export function transformRequest(request: Request): {
    method: 'create' | 'delete' | 'deleteMany' | 'find' | 'findOne' | 'findMany' | 'update' | 'updateMany',
    key?: any,
    data?: any,
    options: any,
    args: any[]
  } {
    const {resource} = request;

    if (resource instanceof Collection || resource instanceof Singleton) {
      const {args, operation} = request;
      let options: any = {};
      const entityMetadata = EntityMetadata.get(resource.type.ctor);
      if (!entityMetadata)
        throw new Error(`Type class "${resource.type.ctor}" is not an SQB entity`);

      if (resource instanceof Collection) {
        const primaryIndex = entityMetadata.indexes.find(x => x.primary);
        // Check if resource primary keys are same with entity
        const primaryKeys = [...(primaryIndex && primaryIndex.columns) || []];
        if (primaryKeys.sort().join() !== [...resource.primaryKey].sort().join())
          throw new Error('Resource primaryKey definition differs from SQB Entity primaryKey definition');
      }

      if (operation === 'create' || operation === 'update' ||
          operation === 'get' || operation === 'findMany'
      ) {
        options.pick = args.pick?.length ? args.pick : undefined;
        options.omit = args.omit?.length ? args.omit : undefined;
        options.include = args.include?.length ? args.include : undefined;
      }

      if (resource instanceof Collection && args.filter) {
        options.filter = _transformFilter(args.filter);
      }

      if (operation === 'findMany') {
        options.sort = args.sort?.length ? args.sort : undefined;
        options.limit = args.limit;
        options.offset = args.skip;
        options.distinct = args.distinct;
        options.count = args.count;
      }

      options = omitBy(options, isNil);
      if (operation === 'create') {
        return {
          method: 'create',
          data: args.data,
          options,
          args: [args.data, options]
        }
      }

      if (operation === 'deleteMany' || (operation === 'delete' && resource instanceof Singleton)) {
        return {
          method: 'deleteMany',
          options,
          args: [options]
        }
      }

      if (operation === 'delete') {
        return {
          method: 'delete',
          key: args.key,
          options,
          args: [args.key, options]
        }
      }

      if (operation === 'get') {
        if (resource instanceof Singleton)
          return {
            method: 'findOne',
            options,
            args: [options]
          };
        return {
          method: 'find',
          key: args.key,
          options,
          args: [args.key, options]
        };
      }

      if (operation === 'findMany') {
        const out: any = {
          method: 'findMany',
          options,
          args: [options]
        };
        if (args.count)
          out.count = args.count;
        return out;
      }

      if (operation === 'updateMany' || (operation === 'update' && resource instanceof Singleton)) {
        return {
          method: 'updateMany',
          data: args.data,
          options,
          args: [args.data, options]
        }
      }

      if (operation === 'update') {
        return {
          method: 'update',
          key: args.key,
          data: args.data,
          options,
          args: [args.key, args.data, options]
        }
      }
    }
    throw new Error(`Unimplemented request method "${(request as any).operation}"`);
  }

}
