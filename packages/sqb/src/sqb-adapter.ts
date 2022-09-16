import _ from 'lodash';
import { ExecutionRequest } from '@opra/core'
import { Repository, SqbClient, SqbConnection } from '@sqb/connect';
import type { BaseEntityService } from './base-entity-service';
import { convertFilter } from './convert-filter.js';

export namespace SQBAdapter {

  export function prepare(request: ExecutionRequest): {
    method: 'create' | 'findByPk' | 'findAll' | 'update' | 'updateAll' | 'destroy' | 'destroyAll';
    options: any,
    keyValue?: any;
    values?: any;
    args: any[]
  } {
    const {query} = request;
    switch (query.queryType) {
      case 'create': {
        const options: Repository.CreateOptions = _.omitBy({
          pick: query.pick?.length ? query.pick : undefined,
          omit: query.omit?.length ? query.omit : undefined,
          include: query.include?.length ? query.include : undefined,
        }, _.isNil);
        const {data} = query;
        return {
          method: 'create',
          values: data,
          options,
          args: [data, options]
        };
      }
      case 'get': {
        const options: Repository.FindOneOptions = _.omitBy({
          pick: query.pick?.length ? query.pick : undefined,
          omit: query.omit?.length ? query.omit : undefined,
          include: query.include?.length ? query.include : undefined,
        }, _.isNil);
        const keyValue = query.keyValue;
        return {
          method: 'findByPk',
          keyValue,
          options,
          args: [keyValue, options]
        };
      }
      case 'search': {
        const options: BaseEntityService.FindAllOptions = _.omitBy({
          pick: query.pick?.length ? query.pick : undefined,
          omit: query.omit?.length ? query.omit : undefined,
          include: query.include?.length ? query.include : undefined,
          sort: query.sort?.length ? query.sort : undefined,
          limit: query.limit,
          offset: query.skip,
          distinct: query.distinct,
          total: query.total,
          filter: convertFilter(query.filter)
        }, _.isNil)
        return {
          method: 'findAll',
          options,
          args: [options]
        };
      }
      case 'update': {
        const options: Repository.UpdateOptions = _.omitBy({
          pick: query.pick?.length ? query.pick : undefined,
          omit: query.omit?.length ? query.omit : undefined,
          include: query.include?.length ? query.include : undefined,
        }, _.isNil);
        const {data} = query;
        const keyValue = query.keyValue;
        return {
          method: 'update',
          keyValue: query.keyValue,
          values: data,
          options,
          args: [keyValue, data, options]
        };
      }
      case 'updateMany': {
        const options: Repository.DestroyOptions = _.omitBy({
          filter: convertFilter(query.filter)
        }, _.isNil);
        const {data} = query;
        return {
          method: 'updateAll',
          options,
          args: [data, options]
        };
      }
      case 'delete': {
        const options = {};
        const keyValue = query.keyValue;
        return {
          method: 'destroy',
          keyValue,
          options,
          args: [keyValue, options]
        };
      }
      case 'deleteMany': {
        const options: Repository.DestroyOptions = _.omitBy({
          filter: convertFilter(query.filter)
        }, _.isNil)
        return {
          method: 'destroyAll',
          options,
          args: [options]
        };
      }
      default:
        throw new Error(`Unimplemented query type "${(query as any).queryType}"`);
    }
  }

  export async function execute(connection: SqbClient | SqbConnection, request: ExecutionRequest): Promise<any> {
    const {query} = request;
    const repo = connection.getRepository(query.resource.dataType.ctor);
    const prepared = prepare(request);
    const out: any = {};
    // @ts-ignore
    const value = await repo[prepared.method](...prepared.args);
    if (value && typeof value === 'object')
      out.value = value;
    if (query.queryType === 'search') {
      if (query.total) {
        out.total = await repo.count(prepared.options);
      }
    }
    if (prepared.method === 'destroy')
      out.affected = value ? 1 : 0;
    else if (prepared.method === 'destroyAll' || prepared.method === 'updateAll')
      out.affected = value;
    return out;
  }

}
