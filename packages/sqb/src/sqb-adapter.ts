import type { OpraFilter } from '@opra/common';
import type { ExecutionContext } from '@opra/core';
import type { HttpContext } from '@opra/http';
import { EntityMetadata, type Repository } from '@sqb/connect';
import _parseFilter from './adapter-utils/parse-filter.js';

export namespace SQBAdapter {
  export type Id = string | number | boolean | Date;
  export type IdOrIds = Id | Record<string, Id>;

  export type FilterInput =
    | OpraFilter.Expression
    | Repository.FindManyOptions['filter']
    | string
    | undefined;

  export const parseFilter = _parseFilter;

  export interface TransformedRequest {
    method:
      | 'create'
      | 'delete'
      | 'deleteMany'
      | 'get'
      | 'replace'
      | 'findMany'
      | 'update'
      | 'updateMany';
    key?: any;
    data?: any;
    options: any;
  }

  export async function parseRequest(
    context: ExecutionContext,
  ): Promise<TransformedRequest> {
    if (context.protocol !== 'http') {
      throw new TypeError('SQBAdapter can parse only HttpContext');
    }
    const ctx = context as HttpContext;
    const { operation } = ctx;

    if (
      operation?.composition?.startsWith('Entity.') &&
      operation.compositionOptions?.type
    ) {
      const dataType = ctx.document.node.getComplexType(
        operation.compositionOptions?.type,
      );
      const entityMetadata = EntityMetadata.get(dataType.ctor!);
      if (!entityMetadata)
        throw new Error(`Type class "${dataType.ctor}" is not an SQB entity`);
      const controller = operation.owner;
      switch (operation.composition) {
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
            operation.parameters.find(p => p.keyParam) ||
            controller.parameters.find(p => p.keyParam);
          const key = keyParam && ctx.pathParams[String(keyParam.name)];
          const options = {
            filter: parseFilter(ctx.queryParams.filter),
          };
          return {
            method: 'delete',
            key,
            options,
          } satisfies TransformedRequest;
        }
        case 'Entity.DeleteMany': {
          const options = {
            filter: parseFilter(ctx.queryParams.filter),
          };
          return { method: 'deleteMany', options } satisfies TransformedRequest;
        }
        case 'Entity.FindMany': {
          const options = {
            count: ctx.queryParams.count,
            filter: parseFilter(ctx.queryParams.filter),
            projection:
              ctx.queryParams.projection ||
              operation.compositionOptions.defaultProjection,
            limit:
              ctx.queryParams.limit ||
              operation.compositionOptions.defaultLimit,
            skip: ctx.queryParams.skip,
            sort:
              ctx.queryParams.sort || operation.compositionOptions.defaultSort,
          };
          return { method: 'findMany', options } satisfies TransformedRequest;
        }
        case 'Entity.Get': {
          const keyParam =
            operation.parameters.find(p => p.keyParam) ||
            controller.parameters.find(p => p.keyParam);
          const key = keyParam && ctx.pathParams[String(keyParam.name)];
          const options = {
            projection: ctx.queryParams.projection,
            filter: parseFilter(ctx.queryParams.filter),
          };
          return { method: 'get', key, options } satisfies TransformedRequest;
        }
        case 'Entity.Replace': {
          const data = await ctx.getBody<any>();
          const keyParam =
            operation.parameters.find(p => p.keyParam) ||
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
            operation.parameters.find(p => p.keyParam) ||
            controller.parameters.find(p => p.keyParam);
          const key = keyParam && ctx.pathParams[String(keyParam.name)];
          const options = {
            projection: ctx.queryParams.projection,
            filter: parseFilter(ctx.queryParams.filter),
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
            filter: parseFilter(ctx.queryParams.filter),
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
    throw new Error(`This operation is not compatible to SQB Adapter`);
  }
}
