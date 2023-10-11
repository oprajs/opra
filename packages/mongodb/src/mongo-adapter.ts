import isNil from 'lodash.isnil';
import omitBy from 'lodash.omitby';
import { Collection, Singleton } from '@opra/common';
import { Request } from '@opra/core';
import _transformFilter from './transform-filter.js';
import _transformKeyValues from './transform-key-values.js'
import _transformPatch from './transform-patch.js';
import _transformProjection from './transform-projection.js';
import _transformSort from './transform-sort.js';

export namespace MongoAdapter {

  export const transformFilter = _transformFilter;
  export const transformKeyValues = _transformKeyValues;
  export const transformPatch = _transformPatch;
  export const transformProjection = _transformProjection;
  export const transformSort = _transformSort;

  export interface TransformedRequest {
    method: 'findOne' | 'find' | 'insertOne' | 'deleteOne' | 'deleteMany' | 'updateOne' | 'updateMany';
    filter?: any;
    data?: any;
    options?: any;
    args: any[];
  }

  export function transformRequest(request: Request): TransformedRequest {
    const {resource} = request;

    if (resource instanceof Collection || resource instanceof Singleton) {
      const {params, endpoint} = request;
      let options: any = {};
      let filter;
      const operation = endpoint.name;

      if (operation === 'create' || operation === 'update' ||
          operation === 'get' || operation === 'findMany'
      ) {
        options.projection = transformProjection(resource.type, params)
      }

      if (resource instanceof Collection &&
          (operation === 'delete' || operation === 'get' || operation === 'update')
      ) {
        filter = transformKeyValues(resource, (request as any).key);
      }

      if (params?.filter) {
        const f = transformFilter(params.filter);
        filter = filter ? {$and: [filter, f]} : f;
      }

      if (operation === 'findMany') {
        options.sort = params?.sort;
        options.limit = params?.limit;
        options.skip = params?.skip;
        options.distinct = params?.distinct;
        options.count = params?.count;
      }

      options = omitBy(options, isNil);

      switch (operation) {
        case 'create': {
          return {
            method: 'insertOne',
            data: (request as any).data,
            options,
            args: [(request as any).data, options]
          }
        }
        case 'delete':
        case 'deleteMany': {
          return {
            method: (operation === 'delete' ? 'deleteOne' : 'deleteMany'),
            filter,
            options,
            args: [filter, options]
          };
        }
        case 'get': {
          return {
            method: 'findOne',
            filter,
            options,
            args: [filter, options]
          }
        }
        case 'findMany': {
          return {
            method: 'find',
            filter,
            options,
            args: [filter, options]
          };
        }
        case 'update': {
          const data = transformPatch((request as any).data);
          filter = filter || {};
          return {
            method: 'updateOne',
            filter,
            data,
            options,
            args: [filter, data, options]
          }
        }
        case 'updateMany': {
          const data = transformPatch((request as any).data);
          return {
            method: 'updateMany',
            filter,
            data,
            options,
            args: [filter, data, options]
          }
        }
      }

    }
    throw new TypeError(`Unimplemented request kind (${request.resource.kind}.${request.endpoint.name})`);
  }


}
