import isNil from 'lodash.isnil';
import omitBy from 'lodash.omitby';
import { OpraQuery } from '@opra/common';
import { Repository } from '@sqb/connect';
import type { BaseEntityService } from './base-entity-service';
import { convertFilter } from './convert-filter.js';

export namespace SQBAdapter {

  export function prepare(query: OpraQuery): {
    method: 'create' | 'count' | 'findByPk' | 'findAll' | 'update' | 'updateAll' | 'destroy' | 'destroyAll';
    options: any,
    keyValue?: any;
    values?: any;
    args: any[]
  } {
    switch (query.method) {
      case 'create': {
        const options: Repository.CreateOptions = omitBy({
          pick: query.pick?.length ? query.pick : undefined,
          omit: query.omit?.length ? query.omit : undefined,
          include: query.include?.length ? query.include : undefined,
        }, isNil);
        const {data} = query;
        return {
          method: 'create',
          values: data,
          options,
          args: [data, options]
        };
      }
      case 'count': {
        const options: BaseEntityService.CountOptions = omitBy({
          filter: convertFilter(query.filter)
        }, isNil)
        return {
          method: 'count',
          options,
          args: [options]
        };
      }
      case 'get': {
        if (query.kind === 'CollectionGetQuery') {
          const options: Repository.FindOneOptions = omitBy({
            pick: query.pick?.length ? query.pick : undefined,
            omit: query.omit?.length ? query.omit : undefined,
            include: query.include?.length ? query.include : undefined,
          }, isNil);
          const keyValue = query.keyValue;
          return {
            method: 'findByPk',
            keyValue,
            options,
            args: [keyValue, options]
          };
        }
        break;
      }
      case 'search': {
        const options: BaseEntityService.SearchOptions = omitBy({
          pick: query.pick?.length ? query.pick : undefined,
          omit: query.omit?.length ? query.omit : undefined,
          include: query.include?.length ? query.include : undefined,
          sort: query.sort?.length ? query.sort : undefined,
          limit: query.limit,
          offset: query.skip,
          distinct: query.distinct,
          total: query.count,
          filter: convertFilter(query.filter)
        }, isNil)
        return {
          method: 'findAll',
          options,
          args: [options]
        };
      }
      case 'update': {
        const options: Repository.UpdateOptions = omitBy({
          pick: query.pick?.length ? query.pick : undefined,
          omit: query.omit?.length ? query.omit : undefined,
          include: query.include?.length ? query.include : undefined,
        }, isNil);
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
        const options: Repository.DestroyOptions = omitBy({
          filter: convertFilter(query.filter)
        }, isNil);
        const {data} = query;
        return {
          method: 'updateAll',
          values: data,
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
        const options: Repository.DestroyOptions = omitBy({
          filter: convertFilter(query.filter)
        }, isNil)
        return {
          method: 'destroyAll',
          options,
          args: [options]
        };
      }
    }
    throw new Error(`Unimplemented query method "${(query as any).method}"`);
  }

}
