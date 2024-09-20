import { OpraFilter } from '@opra/common';
import type { ExecutionContext } from '@opra/core';
import type { HttpContext } from '@opra/http';
import mongodb, { ClientSession, ObjectId } from 'mongodb';
import _prepareFilter from './adapter-utils/prepare-filter.js';
import _prepareKeyValues from './adapter-utils/prepare-key-values.js';
import _preparePatch from './adapter-utils/prepare-patch.js';
import _prepareProjection from './adapter-utils/prepare-projection.js';
import _prepareSort from './adapter-utils/prepare-sort.js';

export namespace MongoAdapter {
  export type AnyId = string | number | ObjectId;
  export type FilterInput<T = any> = OpraFilter.Expression | mongodb.Filter<T> | string | undefined;
  export type WithTransactionCallback = (session: ClientSession) => any;

  export const prepareFilter = _prepareFilter;
  export const prepareKeyValues = _prepareKeyValues;
  export const preparePatch = _preparePatch;
  export const prepareProjection = _prepareProjection;
  export const prepareSort = _prepareSort;

  export interface TransformedRequest {
    method: 'create' | 'delete' | 'deleteMany' | 'get' | 'findMany' | 'update' | 'updateMany';
    key?: any;
    data?: any;
    options: any;
  }

  export async function parseRequest(context: ExecutionContext): Promise<TransformedRequest> {
    if (context.protocol !== 'http') {
      throw new TypeError('MongoAdapter can parse only HttpContext');
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
            projection: ctx.queryParams.projection || operation.compositionOptions.defaultProjection,
            count: ctx.queryParams.count,
            limit: ctx.queryParams.limit || operation.compositionOptions.defaultLimit,
            skip: ctx.queryParams.skip,
            sort: ctx.queryParams.sort || operation.compositionOptions.defaultSort,
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
    throw new Error(`This operation is not compatible to MongoDB adapter`);
  }
}
