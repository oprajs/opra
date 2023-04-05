import isNil from 'lodash.isnil';
import omitBy from 'lodash.omitby';
import {
  CollectionCreateQuery,
  CollectionDeleteManyQuery,
  CollectionDeleteQuery,
  CollectionGetQuery,
  CollectionSearchQuery,
  CollectionUpdateManyQuery,
  CollectionUpdateQuery,
  OpraQuery,
  SingletonCreateQuery,
  SingletonDeleteQuery,
  SingletonGetQuery,
  SingletonUpdateQuery
} from '@opra/core';
import { Repository } from '@sqb/connect';
import { convertFilter } from './convert-filter.js';

export namespace SQBAdapter {

  export const parseFilter = convertFilter;
  export type parseFilter = typeof convertFilter;

  export function parseCollectionCreateQuery(query: CollectionCreateQuery) {
    const options: Repository.CreateOptions = omitBy({
      pick: query.pick?.length ? query.pick : undefined,
      omit: query.omit?.length ? query.omit : undefined,
      include: query.include?.length ? query.include : undefined,
    }, isNil);
    return {
      method: query.method,
      data: query.data,
      options
    };
  }

  export function parseCollectionDeleteQuery(query: CollectionDeleteQuery) {
    const options = {};
    const keyValue = query.keyValue;
    return {
      method: query.method,
      keyValue,
      options
    };
  }

  export function parseCollectionDeleteManyQuery(query: CollectionDeleteManyQuery) {
    const options: Repository.DestroyOptions = omitBy({
      filter: parseFilter(query.filter)
    }, isNil)
    return {
      method: query.method,
      options
    };
  }

  export function parseCollectionGetQuery(query: CollectionGetQuery) {
    const options: Repository.FindOneOptions = omitBy({
      pick: query.pick?.length ? query.pick : undefined,
      omit: query.omit?.length ? query.omit : undefined,
      include: query.include?.length ? query.include : undefined,
    }, isNil);
    const keyValue = query.keyValue;
    return {
      method: query.method,
      keyValue,
      options
    };
  }

  export function parseSingletonGetQuery(query: SingletonGetQuery) {
    const options: Repository.FindOneOptions = omitBy({
      pick: query.pick?.length ? query.pick : undefined,
      omit: query.omit?.length ? query.omit : undefined,
      include: query.include?.length ? query.include : undefined,
    }, isNil);
    return {
      method: query.method,
      options
    };
  }

  export function parseCollectionUpdateQuery(query: CollectionUpdateQuery) {
    const options: Repository.UpdateOptions = omitBy({
      pick: query.pick?.length ? query.pick : undefined,
      omit: query.omit?.length ? query.omit : undefined,
      include: query.include?.length ? query.include : undefined,
    }, isNil);
    return {
      method: query.method,
      keyValue: query.keyValue,
      data: query.data,
      options
    };
  }

  export function parseCollectionUpdateManyQuery(query: CollectionUpdateManyQuery) {
    const options: Repository.DestroyOptions = omitBy({
      filter: parseFilter(query.filter)
    }, isNil);
    return {
      method: query.method,
      data: query.data,
      options
    };
  }

  export function parseCollectionSearchQuery(query: CollectionSearchQuery) {
    const options: Repository.FindAllOptions = omitBy({
      pick: query.pick?.length ? query.pick : undefined,
      omit: query.omit?.length ? query.omit : undefined,
      include: query.include?.length ? query.include : undefined,
      sort: query.sort?.length ? query.sort : undefined,
      limit: query.limit,
      offset: query.skip,
      distinct: query.distinct,
      total: query.count,
      filter: parseFilter(query.filter)
    }, isNil)
    return {
      method: query.method,
      options
    };
  }

  export function parseSingletonCreateQuery(query: SingletonCreateQuery) {
    const options: Repository.CreateOptions = omitBy({
      pick: query.pick?.length ? query.pick : undefined,
      omit: query.omit?.length ? query.omit : undefined,
      include: query.include?.length ? query.include : undefined,
    }, isNil);
    return {
      method: query.method,
      data: query.data,
      options
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export function parseSingletonDeleteQuery(query: SingletonDeleteQuery) {
    const options = {};
    return {
      method: query.method,
      options,
    };
  }

  export function parseSingletonUpdateQuery(query: SingletonUpdateQuery) {
    const options: Repository.UpdateOptions = omitBy({
      pick: query.pick?.length ? query.pick : undefined,
      omit: query.omit?.length ? query.omit : undefined,
      include: query.include?.length ? query.include : undefined,
    }, isNil);
    return {
      method: query.method,
      data: query.data,
      options
    };
  }

  export function parseQuery(query: OpraQuery): {
    method: string;
    keyValue?: any;
    data?: any;
    options: any;
  } {
    if (query.subject === 'Collection') {
      switch (query.method) {
        case 'create':
          return parseCollectionCreateQuery(query);
        case 'get':
          return parseCollectionGetQuery(query);
        case 'delete':
          return parseCollectionDeleteQuery(query);
        case 'deleteMany':
          return parseCollectionDeleteManyQuery(query);
        case 'update':
          return parseCollectionUpdateQuery(query);
        case 'updateMany':
          return parseCollectionUpdateManyQuery(query);
        case 'search':
          return parseCollectionSearchQuery(query);
      }
    } else if (query.subject === 'Singleton') {
      switch (query.method) {
        case 'create':
          return parseSingletonCreateQuery(query);
        case 'delete':
          return parseSingletonDeleteQuery(query);
        case 'get':
          return parseSingletonGetQuery(query);
        case 'update':
          return parseSingletonUpdateQuery(query);
      }
    }
    throw new Error(`Unimplemented query method "${(query as any).method}"`);
  }

}
