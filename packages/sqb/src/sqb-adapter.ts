import isNil from 'lodash.isnil';
import omitBy from 'lodash.omitby';
import { Request } from '@opra/core';
import { convertFilter } from './convert-filter.js';

export namespace SQBAdapter {

  export const parseFilter = convertFilter;
  export type parseFilter = typeof convertFilter;

  export function parseCollectionCreateRequest(request: Request) {
    /* istanbul ignore next */
    if (!(request.resourceKind === 'Collection' && request.operation === 'create'))
      throw new TypeError('"Request" is not a "CollectionCreateRequest"');
    const {args} = request;
    return {
      method: 'create',
      data: args.data,
      options: omitBy({
        pick: args.pick?.length ? args.pick : undefined,
        omit: args.omit?.length ? args.omit : undefined,
        include: args.include?.length ? args.include : undefined,
      }, isNil)
    };
  }

  export function parseCollectionDeleteRequest(request: Request) {
    /* istanbul ignore next */
    if (!(request.resourceKind === 'Collection' && request.operation === 'delete'))
      throw new TypeError('"Request" is not a "CollectionDeleteRequest"');
    const {args} = request;
    return {
      method: 'destroy',
      key: args.key,
      options: {}
    };
  }

  export function parseCollectionDeleteManyRequest(request: Request) {
    /* istanbul ignore next */
    if (!(request.resourceKind === 'Collection' && request.operation === 'deleteMany'))
      throw new TypeError('"Request" is not a "CollectionDeleteManyRequest"');
    const {args} = request;
    return {
      method: 'destroyAll',
      options: omitBy({
        filter: parseFilter(args.filter)
      }, isNil)
    };
  }

  export function parseCollectionGetRequest(request: Request) {
    /* istanbul ignore next */
    if (!(request.resourceKind === 'Collection' && request.operation === 'get'))
      throw new TypeError('"Request" is not a "CollectionGetRequest"');
    const {args} = request;
    return {
      method: 'findByPk',
      key: args.key,
      options: omitBy({
        pick: args.pick?.length ? args.pick : undefined,
        omit: args.omit?.length ? args.omit : undefined,
        include: args.include?.length ? args.include : undefined,
      }, isNil)
    };
  }

  export function parseCollectionUpdateRequest(request: Request) {
    /* istanbul ignore next */
    if (!(request.resourceKind === 'Collection' && request.operation === 'update'))
      throw new TypeError('"Request" is not a "CollectionUpdateRequest"');
    const {args} = request;
    return {
      method: 'update',
      key: args.key,
      data: args.data,
      options: omitBy({
        pick: args.pick?.length ? args.pick : undefined,
        omit: args.omit?.length ? args.omit : undefined,
        include: args.include?.length ? args.include : undefined,
      }, isNil)
    };
  }

  export function parseCollectionUpdateManyRequest(request: Request) {
    /* istanbul ignore next */
    if (!(request.resourceKind === 'Collection' && request.operation === 'updateMany'))
      throw new TypeError('"Request" is not a "CollectionUpdateManyRequest"');
    const {args} = request;
    return {
      method: 'updateAll',
      data: args.data,
      options: omitBy({
        filter: parseFilter(args.filter)
      }, isNil)
    };
  }

  export function parseCollectionSearchRequest(request: Request) {
    /* istanbul ignore next */
    if (!(request.resourceKind === 'Collection' && request.operation === 'search'))
      throw new TypeError('"Request" is not a "CollectionSearchRequest"');
    const {args} = request;
    return {
      method: 'findAll',
      options: omitBy({
        pick: args.pick?.length ? args.pick : undefined,
        omit: args.omit?.length ? args.omit : undefined,
        include: args.include?.length ? args.include : undefined,
        sort: args.sort?.length ? args.sort : undefined,
        limit: args.limit,
        offset: args.skip,
        distinct: args.distinct,
        count: args.count,
        filter: parseFilter(args.filter)
      }, isNil)
    };
  }

  export function parseSingletonGetRequest(request: Request) {
    /* istanbul ignore next */
    if (!(request.resourceKind === 'Singleton' && request.operation === 'get'))
      throw new TypeError('"Request" is not a "SingletonGetRequest"');
    const {args} = request;
    return {
      method: 'findOne',
      options: omitBy({
        pick: args.pick?.length ? args.pick : undefined,
        omit: args.omit?.length ? args.omit : undefined,
        include: args.include?.length ? args.include : undefined,
      }, isNil)
    };
  }

  export function parseSingletonCreateRequest(request: Request) {
    /* istanbul ignore next */
    if (!(request.resourceKind === 'Singleton' && request.operation === 'create'))
      throw new TypeError('"Request" is not a "SingletonCreateRequest"');
    const {args} = request;
    return {
      method: 'create',
      data: args.data,
      options: omitBy({
        pick: args.pick?.length ? args.pick : undefined,
        omit: args.omit?.length ? args.omit : undefined,
        include: args.include?.length ? args.include : undefined,
      }, isNil)
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export function parseSingletonDeleteRequest(request: Request) {
    /* istanbul ignore next */
    if (!(request.resourceKind === 'Singleton' && request.operation === 'delete'))
      throw new TypeError('"Request" is not a "SingletonDeleteRequest"');
    return {
      method: 'destroyAll',
      options: {},
    };
  }

  export function parseSingletonUpdateRequest(request: Request) {
    /* istanbul ignore next */
    if (!(request.resourceKind === 'Singleton' && request.operation === 'update'))
      throw new TypeError('"Request" is not a "SingletonUpdateRequest"');
    const {args} = request;
    return {
      method: 'updateAll',
      data: args.data,
      options: omitBy({
        pick: args.pick?.length ? args.pick : undefined,
        omit: args.omit?.length ? args.omit : undefined,
        include: args.include?.length ? args.include : undefined,
      }, isNil)
    };
  }

  export function parseRequest(request: Request): {
    method: string;
    key?: any;
    data?: any;
    options: any;
  } {
    if (request.resourceKind === 'Collection') {
      switch (request.operation) {
        case 'create':
          return parseCollectionCreateRequest(request);
        case 'get':
          return parseCollectionGetRequest(request);
        case 'delete':
          return parseCollectionDeleteRequest(request);
        case 'deleteMany':
          return parseCollectionDeleteManyRequest(request);
        case 'update':
          return parseCollectionUpdateRequest(request);
        case 'updateMany':
          return parseCollectionUpdateManyRequest(request);
        case 'search':
          return parseCollectionSearchRequest(request);
      }
    } else if (request.resourceKind === 'Singleton') {
      switch (request.operation) {
        case 'create':
          return parseSingletonCreateRequest(request);
        case 'delete':
          return parseSingletonDeleteRequest(request);
        case 'get':
          return parseSingletonGetRequest(request);
        case 'update':
          return parseSingletonUpdateRequest(request);
      }
    }
    throw new Error(`Unimplemented request method "${(request as any).method}"`);
  }

}
