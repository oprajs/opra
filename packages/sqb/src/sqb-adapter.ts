import _ from 'lodash';
import { OpraAnyQuery } from '@opra/schema';
import { Repository } from '@sqb/connect';
import type { BaseEntityService } from './base-entity-service';
import { convertFilter } from './convert-filter.js';

export namespace SQBAdapter {

  export function prepare(query: OpraAnyQuery): {
    method: 'create' | 'findByPk' | 'findAll' | 'update' | 'updateAll' | 'destroy' | 'destroyAll';
    options: any,
    keyValue?: any;
    values?: any;
    args: any[]
  } {
    switch (query.method) {
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
        if (query.kind === 'GetInstanceQuery') {
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
        break;
      }
      case 'search': {
        const options: BaseEntityService.SearchOptions = _.omitBy({
          pick: query.pick?.length ? query.pick : undefined,
          omit: query.omit?.length ? query.omit : undefined,
          include: query.include?.length ? query.include : undefined,
          sort: query.sort?.length ? query.sort : undefined,
          limit: query.limit,
          offset: query.skip,
          distinct: query.distinct,
          total: query.count,
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
    }
    throw new Error(`Unimplemented query method "${(query as any).method}"`);
  }

}
