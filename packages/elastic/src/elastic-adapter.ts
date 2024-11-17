import type { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types.js';
import { OpraFilter } from '@opra/common';
import type { ExecutionContext } from '@opra/core';
import { HttpContext } from '@opra/http/src/index';
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
    method: 'create' | 'delete' | 'deleteMany' | 'get' | 'replace' | 'findMany' | 'update' | 'updateMany';
    key?: any;
    data?: any;
    options: any;
  }

  export async function parseRequest(context: ExecutionContext): Promise<TransformedRequest> {
    if (context.protocol !== 'http') {
      throw new TypeError('ElasticAdapter can parse only HttpContext');
    }
    const ctx = context as HttpContext;
    const { operation } = ctx;
    if (operation?.composition?.startsWith('Entity.') && operation.compositionOptions?.type) {
      const controller = operation.owner;
      switch (operation.composition) {
        case 'Entity.Create': {
          const data = await ctx.getBody<any>();
          const options = {
            projection: ctx.queryParams.projection,
          };
          return { method: 'create', data, options } satisfies TransformedRequest;
        }
        case 'Entity.Delete': {
          const keyParam = operation.parameters.find(p => p.keyParam) || controller.parameters.find(p => p.keyParam);
          const key = keyParam && ctx.pathParams[String(keyParam.name)];
          const options = {
            filter: ctx.queryParams.filter,
          };
          return { method: 'delete', key, options } satisfies TransformedRequest;
        }
        case 'Entity.DeleteMany': {
          const options = {
            filter: ctx.queryParams.filter,
          };
          return { method: 'deleteMany', options } satisfies TransformedRequest;
        }
        case 'Entity.FindMany': {
          const options = {
            filter: ctx.queryParams.filter,
            projection: ctx.queryParams.projection,
            count: ctx.queryParams.count,
            limit: ctx.queryParams.limit,
            skip: ctx.queryParams.skip,
            sort: ctx.queryParams.sort,
          };
          return { method: 'findMany', options } satisfies TransformedRequest;
        }
        case 'Entity.Get': {
          const keyParam = operation.parameters.find(p => p.keyParam) || controller.parameters.find(p => p.keyParam);
          const key = keyParam && ctx.pathParams[String(keyParam.name)];
          const options = {
            projection: ctx.queryParams.projection,
            filter: ctx.queryParams.filter,
          };
          return { method: 'get', key, options } satisfies TransformedRequest;
        }
        case 'Entity.Replace': {
          const data = await ctx.getBody<any>();
          const keyParam = operation.parameters.find(p => p.keyParam) || controller.parameters.find(p => p.keyParam);
          const key = keyParam && ctx.pathParams[String(keyParam.name)];
          const options = {
            projection: ctx.queryParams.projection,
            filter: ctx.queryParams.filter,
          };
          return { method: 'replace', key, data, options } satisfies TransformedRequest;
        }
        case 'Entity.Update': {
          const data = await ctx.getBody<any>();
          const keyParam = operation.parameters.find(p => p.keyParam) || controller.parameters.find(p => p.keyParam);
          const key = keyParam && ctx.pathParams[String(keyParam.name)];
          const options = {
            projection: ctx.queryParams.projection,
            filter: ctx.queryParams.filter,
          };
          return { method: 'update', key, data, options } satisfies TransformedRequest;
        }
        case 'Entity.UpdateMany': {
          const data = await ctx.getBody<any>();
          const options = {
            filter: ctx.queryParams.filter,
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
