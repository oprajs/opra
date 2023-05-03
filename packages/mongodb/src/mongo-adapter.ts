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

  export function transformRequest(request: Request): any {
    const {resource} = request;

    if (resource instanceof Collection || resource instanceof Singleton) {
      const {args, operation} = request;
      let options: any = {};
      let filter;

      if (operation === 'create' || operation === 'update' ||
          operation === 'get' || operation === 'findMany'
      ) {
        options.projection = transformProjection(resource.type, args)
      }

      if (resource instanceof Collection &&
          (operation === 'delete' || operation === 'get' || operation === 'update')
      ) {
        filter = transformKeyValues(resource, args.key);
      }

      if (args.filter) {
        const f = transformFilter(args.filter);
        filter = filter ? {$and: [filter, f]} : f;
      }

      if (operation === 'findMany') {
        options.sort = args.sort?.length ? args.sort : undefined;
        options.limit = args.limit;
        options.skip = args.skip;
        options.distinct = args.distinct;
        options.count = args.count;
      }

      options = omitBy(options, isNil);

      switch (operation) {
        case 'create': {
          return {
            method: 'insertOne',
            data: args.data,
            options,
            args: [args.data, options]
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
          const out: any = {
            method: 'find',
            filter,
            options,
            args: [filter, options]
          };
          if (args.count)
            out.count = args.count;
          return out;
        }
        case 'update': {
          const update = transformPatch(args.data);
          filter = filter || {};
          return {
            method: 'updateOne',
            filter,
            update,
            options,
            args: [filter, update, options]
          }
        }
        case 'updateMany': {
          const update = transformPatch(args.data);
          return {
            method: 'updateMany',
            filter,
            update,
            options,
            args: [filter, update, options]
          }
        }
      }

    }
    throw new TypeError(`Unimplemented request kind (${request.resourceKind}.${request.operation})`);
  }


}
