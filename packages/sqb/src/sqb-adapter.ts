import { type OpraFilter } from '@opra/common';
import { HttpContext } from '@opra/core';
import { EntityMetadata, type Repository } from '@sqb/connect';
import _parseFilter from './adapter-utils/parse-filter.js';

export namespace SQBAdapter {
  export type Id = string | number | boolean | Date;
  export type IdOrIds = Id | Record<string, Id>;

  export type FilterInput = OpraFilter.Expression | Repository.FindManyOptions['filter'] | string | undefined;

  export const parseFilter = _parseFilter;

  export interface TransformedRequest {
    method: 'create' | 'delete' | 'deleteMany' | 'get' | 'findMany' | 'update' | 'updateMany';
    key?: any;
    data?: any;
    options: any;
  }

  export async function parseRequest(context: HttpContext): Promise<TransformedRequest> {
    const { operation } = context;

    if (operation.composition?.startsWith('Entity.') && operation.compositionOptions?.type) {
      const dataType = context.document.node.getComplexType(operation.compositionOptions?.type);
      const entityMetadata = EntityMetadata.get(dataType.ctor!);
      if (!entityMetadata) throw new Error(`Type class "${dataType.ctor}" is not an SQB entity`);
      const { compositionOptions } = operation;
      switch (operation.composition) {
        case 'Entity.Create': {
          const data = await context.getBody<any>();
          const options = {
            projection: context.queryParams.projection,
          };
          return { method: 'create', data, options } satisfies TransformedRequest;
        }
        case 'Entity.Delete': {
          const key = context.pathParams[compositionOptions.keyParameter];
          const options = {
            filter: parseFilter(context.queryParams.filter),
          };
          return { method: 'delete', key, options } satisfies TransformedRequest;
        }
        case 'Entity.DeleteMany': {
          const options = {
            filter: parseFilter(context.queryParams.filter),
          };
          return { method: 'deleteMany', options } satisfies TransformedRequest;
        }
        case 'Entity.FindMany': {
          const options = {
            count: context.queryParams.count,
            filter: parseFilter(context.queryParams.filter),
            limit: context.queryParams.limit,
            offset: context.queryParams.skip,
            projection: context.queryParams.projection,
            sort: context.queryParams.sort,
          };
          return { method: 'findMany', options } satisfies TransformedRequest;
        }
        case 'Entity.Get': {
          const key = context.pathParams[compositionOptions.keyParameter];
          const options = {
            projection: context.queryParams.projection,
            filter: parseFilter(context.queryParams.filter),
          };
          return { method: 'get', key, options } satisfies TransformedRequest;
        }
        case 'Entity.Update': {
          const data = await context.getBody<any>();
          const key = context.pathParams[compositionOptions.keyParameter];
          const options = {
            projection: context.queryParams.projection,
            filter: parseFilter(context.queryParams.filter),
          };
          return { method: 'update', key, data, options } satisfies TransformedRequest;
        }
        case 'Entity.UpdateMany': {
          const data = await context.getBody<any>();
          const options = {
            filter: parseFilter(context.queryParams.filter),
          };
          return { method: 'updateMany', data, options } satisfies TransformedRequest;
        }
      }
    }
    throw new Error(`This operation is not compatible to SQB Adapter`);
  }
}
