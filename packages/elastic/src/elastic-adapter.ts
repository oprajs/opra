/* eslint-disable camelcase */
import isNil from 'lodash.isnil';
import omitBy from 'lodash.omitby';
import { SearchRequest } from '@elastic/elasticsearch/lib/api/types';
import { TransportRequestOptions } from '@elastic/transport';
import { Collection, Singleton } from '@opra/common';
import { Request } from '@opra/core';
import _transformFilter from './transform-filter.js';
import _transformKeyValues from './transform-key-values.js'
import _transformProjection from './transform-projection.js';
import _transformSort from './transform-sort.js';

export namespace ElasticAdapter {

  export const transformFilter = _transformFilter;
  export const transformKeyValues = _transformKeyValues;
  export const transformProjection = _transformProjection;
  export const transformSort = _transformSort;

  export function transformRequest(request: Request): any {
    const {resource} = request;

    if (resource instanceof Collection || resource instanceof Singleton) {
      const {args, operation} = request;
      let options: TransportRequestOptions = {};
      switch (operation) {
        case 'findMany': {
          let params: SearchRequest = {};
          const filter = transformFilter(args.filter);
          if (filter)
            params.query = filter;
          if (args.limit != null)
            params.size = args.limit;
          if (args.skip != null)
            params.from = args.skip;
          if (args.count)
            params.track_total_hits = true;
          if (args.pick || args.include || args.omit)
            params._source = _transformProjection(resource.type, args);
          if (args.sort)
            params.sort = _transformSort(args.sort);
          params = omitBy(params, isNil);
          options = omitBy(options, isNil);
          return {
            method: 'search',
            params,
            options,
            args: [params, options]
          };
        }

      }
    }
    throw new TypeError(`Unimplemented request (${request.resourceKind}.${request.operation})`);
  }

}
