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

  export interface TransformedRequest {
    method: 'create' | 'delete' | 'deleteMany' | 'find' | 'findOne' | 'findMany' | 'update' | 'updateMany',
    key?: any,
    data?: any,
    options: any,
    args: any[]
  }

  export function transformRequest(request: Request): TransformedRequest {
    const {resource} = request;

    if (resource instanceof Collection || resource instanceof Singleton) {
      const {params, operation} = request;
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
        options.pick = params?.pick;
        options.omit = params?.omit;
        options.include = params?.include;
      }

      if (resource instanceof Collection && params?.filter) {
        options.filter = _transformFilter(params.filter);
      }

      if (operation === 'findMany') {
        options.sort = params?.sort;
        options.limit = params?.limit;
        options.offset = params?.skip;
        options.distinct = params?.distinct;
        options.count = params?.count;
      }

      options = omitBy(options, isNil);
      if (operation === 'create') {
        return {
          method: 'create',
          data: (request as any).data,
          options,
          args: [(request as any).data, options]
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
          key: (request as any).key,
          options,
          args: [(request as any).key, options]
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
          key: (request as any).key,
          options,
          args: [(request as any).key, options]
        };
      }

      if (operation === 'findMany') {
        const out: any = {
          method: 'findMany',
          options,
          args: [options]
        };
        out.count = params?.count;
        return out;
      }

      if (operation === 'updateMany' || (operation === 'update' && resource instanceof Singleton)) {
        return {
          method: 'updateMany',
          data: (request as any).data,
          options,
          args: [(request as any).data, options]
        }
      }

      if (operation === 'update') {
        return {
          method: 'update',
          key: (request as any).key,
          data: (request as any).data,
          options,
          args: [(request as any).key, (request as any).data, options]
        }
      }
    }
    throw new Error(`Unimplemented request method "${(request as any).operation}"`);
  }

}
