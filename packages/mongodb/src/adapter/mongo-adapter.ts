import { OpraFilter } from '@opra/common';
import type { ExecutionContext } from '@opra/core';
import type { HttpContext } from '@opra/http';
import mongodb, { ObjectId } from 'mongodb';
import _prepareFilter from './prepare-filter.js';
import _prepareKeyValues from './prepare-key-values.js';
import _prepareProjection from './prepare-projection.js';
import _prepareSort from './prepare-sort.js';

export namespace MongoAdapter {
  export type AnyId = string | number | ObjectId;
  export type FilterInput<T = any> =
    | OpraFilter.Expression
    | mongodb.Filter<T>
    | string
    | undefined;

  export const prepareFilter = _prepareFilter;
  export const prepareKeyValues = _prepareKeyValues;
  export const prepareProjection = _prepareProjection;
  export const prepareSort = _prepareSort;

  export interface TransformedRequest {
    method:
      | 'create'
      | 'delete'
      | 'deleteMany'
      | 'get'
      | 'findMany'
      | 'replace'
      | 'update'
      | 'updateMany';
    key?: any;
    data?: any;
    options: any;
  }

  export async function parseRequest(
    context: ExecutionContext,
  ): Promise<TransformedRequest> {
    if (context.transport !== 'http') {
      throw new TypeError('MongoAdapter can parse only HttpContext');
    }
    const ctx = context as HttpContext;
    const { __oprDef } = ctx;
    if (
      __oprDef?.composition?.startsWith('Entity.') &&
      __oprDef.compositionOptions?.type
    ) {
      const controller = __oprDef.owner;
      switch (__oprDef.composition) {
        case 'Entity.Create': {
          const data = await ctx.getBody<any>();
          const options = {
            projection: ctx.queryParams.projection,
          };
          return {
            method: 'create',
            data,
            options,
          } satisfies TransformedRequest;
        }
        case 'Entity.Delete': {
          const keyParam =
            __oprDef.parameters.find(p => p.keyParam) ||
            controller.parameters.find(p => p.keyParam);
          const key = keyParam && ctx.pathParams[String(keyParam.name)];
          const options = {
            filter: ctx.queryParams.filter,
          };
          return {
            method: 'delete',
            key,
            options,
          } satisfies TransformedRequest;
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
            projection:
              ctx.queryParams.projection ||
              __oprDef.compositionOptions.defaultProjection,
            count: ctx.queryParams.count,
            limit:
              ctx.queryParams.limit || __oprDef.compositionOptions.defaultLimit,
            skip: ctx.queryParams.skip,
            sort:
              ctx.queryParams.sort || __oprDef.compositionOptions.defaultSort,
          };
          return { method: 'findMany', options } satisfies TransformedRequest;
        }
        case 'Entity.Get': {
          const keyParam =
            __oprDef.parameters.find(p => p.keyParam) ||
            controller.parameters.find(p => p.keyParam);
          const key = keyParam && ctx.pathParams[String(keyParam.name)];
          const options = {
            projection: ctx.queryParams.projection,
            filter: ctx.queryParams.filter,
          };
          return { method: 'get', key, options } satisfies TransformedRequest;
        }
        case 'Entity.Replace': {
          const data = await ctx.getBody<any>();
          const keyParam =
            __oprDef.parameters.find(p => p.keyParam) ||
            controller.parameters.find(p => p.keyParam);
          const key = keyParam && ctx.pathParams[String(keyParam.name)];
          const options = {
            projection: ctx.queryParams.projection,
            filter: ctx.queryParams.filter,
          };
          return {
            method: 'replace',
            key,
            data,
            options,
          } satisfies TransformedRequest;
        }
        case 'Entity.Update': {
          const data = await ctx.getBody<any>();
          const keyParam =
            __oprDef.parameters.find(p => p.keyParam) ||
            controller.parameters.find(p => p.keyParam);
          const key = keyParam && ctx.pathParams[String(keyParam.name)];
          const options = {
            projection: ctx.queryParams.projection,
            filter: ctx.queryParams.filter,
          };
          return {
            method: 'update',
            key,
            data,
            options,
          } satisfies TransformedRequest;
        }
        case 'Entity.UpdateMany': {
          const data = await ctx.getBody<any>();
          const options = {
            filter: ctx.queryParams.filter,
          };
          return {
            method: 'updateMany',
            data,
            options,
          } satisfies TransformedRequest;
        }
        default:
          break;
      }
    }
    throw new Error(`This operation is not compatible to MongoDB adapter`);
  }
}
