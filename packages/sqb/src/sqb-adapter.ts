import _ from 'lodash';
import { ExecutionRequest } from '@opra/core'
import { Repository, SqbClient, SqbConnection } from '@sqb/connect';
import { convertFilter } from './convert-filter.js';
import { covertKey } from './covert-key.js';

export namespace SQBAdapter {

  export function prepare(request: ExecutionRequest): {
    method: string;
    args: any;
  } {
    const {query} = request;
    switch (query.queryType) {
      case 'search': {
        const args: Repository.FindAllOptions & { total?: boolean } = {
          pick: query.pick?.length ? query.pick : undefined,
          omit: query.omit?.length ? query.omit : undefined,
          include: query.include?.length ? query.include : undefined,
          sort: query.sort?.length ? query.sort : undefined,
          limit: query.limit,
          offset: query.skip,
          distinct: query.distinct,
          total: query.total,
          filter: convertFilter(query.filter)
        };
        return {
          method: 'findAll',
          args: _.omitBy(args, _.isNil)
        };
      }
      case 'read': {
        const filter = covertKey(query.resource.dataType, query.key);
        const args: Repository.FindOneOptions = {
          pick: query.pick?.length ? query.pick : undefined,
          omit: query.omit?.length ? query.omit : undefined,
          filter
        };
        return {
          method: 'findOne',
          args: _.omitBy(args, _.isNil)
        };
      }
      case 'delete': {
        const filter = covertKey(query.resource.dataType, query.key);
        const args: Repository.FindOneOptions = {
          filter
        };
        return {
          method: 'destroy',
          args: _.omitBy(args, _.isNil)
        };
      }
      case 'deleteMany': {
        const args: Repository.FindOneOptions = {
          filter: convertFilter(query.filter)
        };
        return {
          method: 'destroyAll',
          args: _.omitBy(args, _.isNil)
        };
      }
      default:
        throw new Error(`Unimplemented query type "${query.queryType}"`);
    }
  }

  export async function execute(connection: SqbClient | SqbConnection, request: ExecutionRequest): Promise<{
    total?: number;
    items?: any[];
  }> {
    const {query} = request;
    const repo = connection.getRepository(query.resource.dataType.ctor);
    const prepared = prepare(request);
    const out: any = {};
    const value = await repo[prepared.method](prepared.args);
    if (value && typeof value === 'object')
      out.value = value;
    if (query.queryType === 'search') {
      if (query.total) {
        out.count = await repo.count(prepared.args);
      }
    }
    if (query.queryType === 'delete') {
      out.affected = value ? 1 : 0;
    }
    if (query.queryType === 'deleteMany') {
      out.affected = value;
    }
    return out;
  }

}
