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
    const {source} = request;

    if (source instanceof Collection || source instanceof Singleton) {
      const {params, endpoint} = request;
      let options: any = {};
      const entityMetadata = EntityMetadata.get(source.type.ctor);
      if (!entityMetadata)
        throw new Error(`Type class "${source.type.ctor}" is not an SQB entity`);

      if (source instanceof Collection) {
        const primaryIndex = entityMetadata.indexes.find(x => x.primary);
        // Check if source primary keys are same with entity
        const primaryKeys = [...(primaryIndex && primaryIndex.columns) || []];
        if (primaryKeys.sort().join() !== [...source.primaryKey].sort().join())
          throw new Error('Source primaryKey definition differs from SQB Entity primaryKey definition');
      }

      if (endpoint === 'create' || endpoint === 'update' ||
          endpoint === 'get' || endpoint === 'findMany'
      ) {
        options.pick = params?.pick;
        options.omit = params?.omit;
        options.include = params?.include;
      }

      if (source instanceof Collection && params?.filter) {
        options.filter = _transformFilter(params.filter);
      }

      if (endpoint === 'findMany') {
        options.sort = params?.sort;
        options.limit = params?.limit;
        options.offset = params?.skip;
        options.distinct = params?.distinct;
        options.count = params?.count;
      }

      options = omitBy(options, isNil);
      if (endpoint === 'create') {
        return {
          method: 'create',
          data: (request as any).data,
          options,
          args: [(request as any).data, options]
        }
      }

      if (endpoint === 'deleteMany' || (endpoint === 'delete' && source instanceof Singleton)) {
        return {
          method: 'deleteMany',
          options,
          args: [options]
        }
      }

      if (endpoint === 'delete') {
        return {
          method: 'delete',
          key: (request as any).key,
          options,
          args: [(request as any).key, options]
        }
      }

      if (endpoint === 'get') {
        if (source instanceof Singleton)
          return {
            method: 'findOne',
            options,
            args: [options]
          };
        return {
          method: 'find',
          key: (request as any).key,
          options,
          args: [(request as any).key, options]
        };
      }

      if (endpoint === 'findMany') {
        const out: any = {
          method: 'findMany',
          options,
          args: [options]
        };
        out.count = params?.count;
        return out;
      }

      if (endpoint === 'updateMany' || (endpoint === 'update' && source instanceof Singleton)) {
        return {
          method: 'updateMany',
          data: (request as any).data,
          options,
          args: [(request as any).data, options]
        }
      }

      if (endpoint === 'update') {
        return {
          method: 'update',
          key: (request as any).key,
          data: (request as any).data,
          options,
          args: [(request as any).key, (request as any).data, options]
        }
      }
    }
    throw new Error(`Unimplemented request method "${(request as any).endpoint}"`);
  }

}
