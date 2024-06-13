/* eslint-disable camelcase */
import { SearchRequest } from '@elastic/elasticsearch/lib/api/types';
import { TransportRequestOptions } from '@elastic/transport';
import { Collection, omitNullish, Singleton } from '@opra/common';
import { Request } from '@opra/core';
import _transformFilter from './transform-filter.js';
import _transformKeyValues from './transform-key-values.js';
import _transformProjection from './transform-projection.js';
import _transformSort from './transform-sort.js';

export namespace ElasticAdapter {
  export const transformFilter = _transformFilter;
  export const transformKeyValues = _transformKeyValues;
  export const transformProjection = _transformProjection;
  export const transformSort = _transformSort;

  export function transformRequest(request: Request): any {
    const { resource } = request;

    if (resource instanceof Collection || resource instanceof Singleton) {
      const { params, endpoint } = request;
      let options: TransportRequestOptions = {};
      switch (endpoint.name) {
        case 'findMany': {
          let searchRequest: SearchRequest = {};
          const filter = transformFilter(params?.filter);
          if (filter) searchRequest.query = filter;
          if (params?.limit != null) searchRequest.size = params.limit;
          if (params?.skip != null) searchRequest.from = params.skip;
          if (params?.count) searchRequest.track_total_hits = true;
          if (params?.pick || params?.include || params?.omit)
            searchRequest._source = _transformProjection(resource.type, params);
          if (params?.sort) searchRequest.sort = _transformSort(params.sort);
          searchRequest = omitNullish(searchRequest);
          options = omitNullish(options);
          return {
            method: 'search',
            params: searchRequest,
            options,
            args: [searchRequest, options],
          };
        }
      }
    }
    throw new TypeError(`Unimplemented request (${request.resource.kind}.${request.endpoint.name})`);
  }
}
