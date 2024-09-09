import type { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types.js';
import { OpraFilter } from '@opra/common';
import { HttpContext } from '@opra/core';
import _prepareFilter from './adapter-utils/prepare-filter.js';
import _preparePatch from './adapter-utils/prepare-patch.js';
import _prepareProjection from './adapter-utils/prepare-projection.js';
import _prepareSort from './adapter-utils/prepare-sort.js';

export namespace ElasticAdapter {
  export type FilterInput = OpraFilter.Expression | QueryDslQueryContainer | string | undefined;

  export const prepareFilter = _prepareFilter;
  export const preparePatch = _preparePatch;
  export const prepareProjection = _prepareProjection;
  export const prepareSort = _prepareSort;

  export interface TransformedRequest {
    method: 'create' | 'delete' | 'deleteMany' | 'get' | 'findMany' | 'update' | 'updateMany';
    key?: any;
    data?: any;
    options: any;
  }

  export async function parseRequest(context: HttpContext): Promise<TransformedRequest> {
    const { operation } = context;
    if (operation?.composition?.startsWith('Entity.') && operation.compositionOptions?.type) {
      const controller = operation.owner;
      switch (operation.composition) {
        case 'Entity.Create': {
          const data = await context.getBody<any>();
          const options = {
            projection: context.queryParams.projection,
          };
          return { method: 'create', data, options } satisfies TransformedRequest;
        }
        case 'Entity.Delete': {
          const keyParam = operation.parameters.find(p => p.keyParam) || controller.parameters.find(p => p.keyParam);
          const key = keyParam && context.pathParams[String(keyParam.name)];
          const options = {
            filter: context.queryParams.filter,
          };
          return { method: 'delete', key, options } satisfies TransformedRequest;
        }
        case 'Entity.DeleteMany': {
          const options = {
            filter: context.queryParams.filter,
          };
          return { method: 'deleteMany', options } satisfies TransformedRequest;
        }
        case 'Entity.FindMany': {
          const options = {
            filter: context.queryParams.filter,
            projection: context.queryParams.projection,
            count: context.queryParams.count,
            limit: context.queryParams.limit,
            skip: context.queryParams.skip,
            sort: context.queryParams.sort,
          };
          return { method: 'findMany', options } satisfies TransformedRequest;
        }
        case 'Entity.Get': {
          const keyParam = operation.parameters.find(p => p.keyParam) || controller.parameters.find(p => p.keyParam);
          const key = keyParam && context.pathParams[String(keyParam.name)];
          const options = {
            projection: context.queryParams.projection,
            filter: context.queryParams.filter,
          };
          return { method: 'get', key, options } satisfies TransformedRequest;
        }
        case 'Entity.Update': {
          const data = await context.getBody<any>();
          const keyParam = operation.parameters.find(p => p.keyParam) || controller.parameters.find(p => p.keyParam);
          const key = keyParam && context.pathParams[String(keyParam.name)];
          const options = {
            projection: context.queryParams.projection,
            filter: context.queryParams.filter,
          };
          return { method: 'update', key, data, options } satisfies TransformedRequest;
        }
        case 'Entity.UpdateMany': {
          const data = await context.getBody<any>();
          const options = {
            filter: context.queryParams.filter,
          };
          return { method: 'updateMany', data, options } satisfies TransformedRequest;
        }
        default:
          break;
      }
    }
    throw new Error(`This operation is not compatible to Elastic adapter`);
  }
}
