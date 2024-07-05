/* eslint-disable camelcase */
// import { SearchRequest } from '@elastic/elasticsearch/lib/api/types';
// import { TransportRequestOptions } from '@elastic/transport';
// import { omitNullish } from '@opra/common';
import _prepareFilter from './adapter-utils/prepare-filter.js';
import _prepareKeyValues from './adapter-utils/prepare-key-values.js';
// import _prepareProjection from './adapter-utils/prepare-projection.js';
import _prepareSort from './adapter-utils/prepare-sort.js';

export namespace ElasticAdapter {
  export const prepareFilter = _prepareFilter;
  export const prepareKeyValues = _prepareKeyValues;
  // export const prepareProjection = _prepareProjection;
  export const prepareSort = _prepareSort;

  // export function transformRequest(request: Request): any {
  //   const { resource } = request;
  //
  //   if (resource instanceof Collection || resource instanceof Singleton) {
  //     const { params, endpoint } = request;
  //     let options: TransportRequestOptions = {};
  //     switch (endpoint.name) {
  //       case 'findMany': {
  //         let searchRequest: SearchRequest = {};
  //         const filter = transformFilter(params?.filter);
  //         if (filter) searchRequest.query = filter;
  //         if (params?.limit != null) searchRequest.size = params.limit;
  //         if (params?.skip != null) searchRequest.from = params.skip;
  //         if (params?.count) searchRequest.track_total_hits = true;
  //         if (params?.pick || params?.include || params?.omit)
  //           searchRequest._source = _transformProjection(resource.type, params);
  //         if (params?.sort) searchRequest.sort = _transformSort(params.sort);
  //         searchRequest = omitNullish(searchRequest);
  //         options = omitNullish(options);
  //         return {
  //           method: 'search',
  //           params: searchRequest,
  //           options,
  //           args: [searchRequest, options],
  //         };
  //       }
  //     }
  //   }
  //   throw new TypeError(`Unimplemented request (${request.resource.kind}.${request.endpoint.name})`);
  // }
}
