import { toBoolean, toInt } from 'putil-varhelpers';
import {
  BadRequestError,
  Collection,
  ForbiddenError,
  MethodNotAllowedError,
  OpraSchema,
  OpraURL, Singleton,
  translate
} from '@opra/common';
import { OpraAdapter } from '@opra/core';
import { Request } from '../../interfaces/request.interface.js';
import { RequestHost } from '../../request.host.js';
import { parseArrayParam } from '../helpers/query-parsers.js';
import { HttpServerRequest } from '../impl/http-server-request.js';
import { createJsonReader } from './read-json.js';

const kObjectCache = Symbol.for('kObjectCache');

export async function parseCollectionRequest(
    adapter: OpraAdapter,
    incoming: HttpServerRequest,
    resource: Collection,
    url: OpraURL
): Promise<Request> {
  if ((incoming.method === 'POST' || incoming.method === 'PATCH') &&
      incoming.headers['content-type'] !== 'application/json')
    throw new BadRequestError({message: 'Unsupported Content-Type'});

  const contentId = incoming.headers['content-id'] as string;
  const p = url.path[0];
  const params = url.searchParams;
  switch (incoming.method) {
    case 'POST': {
      if (p.key == null) {
        const jsonReader = getReader(adapter, resource, 'create');
        const body = await jsonReader(incoming);
        const pick = parseArrayParam(params.get('$pick'));
        const omit = parseArrayParam(params.get('$omit'));
        const include = parseArrayParam(params.get('$include'));
        return new RequestHost({
          http: incoming,
          kind: 'CollectionCreateRequest',
          contentId,
          resource,
          operation: 'create',
          crud: 'create',
          many: false,
          args: {
            data: body,
            pick: pick && resource.normalizeFieldPath(pick),
            omit: omit && resource.normalizeFieldPath(omit),
            include: include && resource.normalizeFieldPath(include)
          }
        });
      }
      break;
    }
    case 'DELETE': {
      if (p.key != null) {
        assertOperation(resource, 'delete');
        return new RequestHost({
          http: incoming,
          kind: 'CollectionDeleteRequest',
          contentId,
          resource,
          operation: 'delete',
          crud: 'delete',
          many: false,
          args: {
            key: resource.parseKeyValue(p.key)
          }
        });
      }
      assertOperation(resource, 'deleteMany');
      const filter = resource.normalizeFilter(params.get('$filter') as any);
      return new RequestHost({
        http: incoming,
        kind: 'CollectionDeleteManyRequest',
        contentId,
        resource,
        operation: 'deleteMany',
        crud: 'delete',
        many: true,
        args: {
          filter
        }
      });
    }

    case 'GET': {
      const pick = parseArrayParam(params.get('$pick'));
      const omit = parseArrayParam(params.get('$omit'));
      const include = parseArrayParam(params.get('$include'));
      if (p.key != null) {
        assertOperation(resource, 'get');
        return new RequestHost({
          http: incoming,
          kind: 'CollectionGetRequest',
          contentId,
          resource,
          operation: 'get',
          crud: 'read',
          many: false,
          args: {
            key: resource.parseKeyValue(p.key),
            pick: pick && resource.normalizeFieldPath(pick),
            omit: omit && resource.normalizeFieldPath(omit),
            include: include && resource.normalizeFieldPath(include)
          }
        });
      }
      assertOperation(resource, 'findMany');
      const filter = resource.normalizeFilter(params.get('$filter') as any);
      const sort = parseArrayParam(params.get('$sort'));
      return new RequestHost({
        http: incoming,
        kind: 'CollectionFindManyRequest',
        contentId,
        resource,
        operation: 'findMany',
        crud: 'read',
        many: true,
        args: {
          pick: pick && resource.normalizeFieldPath(pick),
          omit: omit && resource.normalizeFieldPath(omit),
          include: include && resource.normalizeFieldPath(include),
          sort: sort && resource.normalizeSortFields(sort),
          filter,
          limit: toInt(params.get('$limit')),
          skip: toInt(params.get('$skip')),
          distinct: toBoolean(params.get('$distinct')),
          count: toBoolean(params.get('$count')),
        }
      });
    }

    case 'PATCH': {
      if (p.key != null) {
        const jsonReader = getReader(adapter, resource, 'update');
        const body = await jsonReader(incoming);
        const pick = parseArrayParam(params.get('$pick'));
        const omit = parseArrayParam(params.get('$omit'));
        const include = parseArrayParam(params.get('$include'));
        return new RequestHost({
          http: incoming,
          kind: 'CollectionUpdateRequest',
          contentId,
          resource,
          operation: 'update',
          crud: 'update',
          many: false,
          args: {
            key: resource.parseKeyValue(p.key),
            data: body,
            pick: pick && resource.normalizeFieldPath(pick),
            omit: omit && resource.normalizeFieldPath(omit),
            include: include && resource.normalizeFieldPath(include),
          }
        });
      }
      const jsonReader = getReader(adapter, resource, 'updateMany');
      const body = await jsonReader(incoming);
      const filter = resource.normalizeFilter(params.get('$filter') as any);
      return new RequestHost({
        http: incoming,
        kind: 'CollectionUpdateManyRequest',
        contentId,
        resource,
        operation: 'updateMany',
        crud: 'update',
        many: true,
        args: {
          data: body,
          filter,
        }
      });
    }
  }
  throw new MethodNotAllowedError({
    message: `Collection resources do not accept http "${incoming.method}" method`
  });
}


export async function parseSingletonRequest(
    adapter: OpraAdapter,
    incoming: HttpServerRequest,
    resource: Singleton,
    url: OpraURL
): Promise<Request> {
  if ((incoming.method === 'POST' || incoming.method === 'PATCH') &&
      incoming.headers['content-type'] !== 'application/json')
    throw new BadRequestError({message: 'Unsupported Content-Type'});

  const contentId = incoming.headers['content-id'] as string;
  const params = url.searchParams;
  switch (incoming.method) {
    case 'POST': {
      const jsonReader = getReader(adapter, resource, 'create');
      const body = await jsonReader(incoming);
      const pick = parseArrayParam(params.get('$pick'));
      const omit = parseArrayParam(params.get('$omit'));
      const include = parseArrayParam(params.get('$include'));
      return new RequestHost({
        http: incoming,
        kind: 'SingletonCreateRequest',
        contentId,
        resource,
        operation: 'create',
        crud: 'create',
        many: false,
        args: {
          data: body,
          pick: pick && resource.normalizeFieldPath(pick),
          omit: omit && resource.normalizeFieldPath(omit),
          include: include && resource.normalizeFieldPath(include),
        }
      });
    }

    case 'DELETE': {
      assertOperation(resource, 'delete');
      return new RequestHost({
        http: incoming,
        kind: 'SingletonDeleteRequest',
        contentId,
        resource,
        operation: 'delete',
        crud: 'delete',
        many: false,
        args: {}
      });
    }

    case 'GET': {
      assertOperation(resource, 'get');
      const pick = parseArrayParam(params.get('$pick'));
      const omit = parseArrayParam(params.get('$omit'));
      const include = parseArrayParam(params.get('$include'));
      return new RequestHost({
        http: incoming,
        kind: 'SingletonGetRequest',
        contentId,
        resource,
        operation: 'get',
        crud: 'read',
        many: false,
        args: {
          pick: pick && resource.normalizeFieldPath(pick),
          omit: omit && resource.normalizeFieldPath(omit),
          include: include && resource.normalizeFieldPath(include),
        }
      });
    }

    case 'PATCH': {
      const jsonReader = getReader(adapter, resource, 'update');
      const body = await jsonReader(incoming);
      const pick = parseArrayParam(params.get('$pick'));
      const omit = parseArrayParam(params.get('$omit'));
      const include = parseArrayParam(params.get('$include'));
      return new RequestHost({
        http: incoming,
        kind: 'SingletonUpdateRequest',
        contentId,
        resource,
        operation: 'update',
        crud: 'update',
        many: false,
        args: {
          data: body,
          pick: pick && resource.normalizeFieldPath(pick),
          omit: omit && resource.normalizeFieldPath(omit),
          include: include && resource.normalizeFieldPath(include),
        }
      });
    }

    default:
      throw new MethodNotAllowedError({
        message: `Singleton resource does not accept http "${incoming.method}" method`
      });
  }
}


function assertOperation(resource: Collection, operation: keyof Collection.Operations): OpraSchema.Endpoint
function assertOperation(resource: Singleton, operation: keyof Singleton.Operations): OpraSchema.Endpoint
function assertOperation(resource: Collection | Singleton, operation: any): OpraSchema.Endpoint {
  const opInstance = resource.operations[operation];
  if (!(opInstance && opInstance.handler))
    throw new ForbiddenError({
      message: translate('RESOLVER_FORBIDDEN', {resource: resource.name, operation},
          `The {{resource}} endpoint does not accept '{{operation}}' operations`),
      severity: 'error',
      code: 'RESOLVER_FORBIDDEN'
    });
  return opInstance;
}

function getReader(adapter: OpraAdapter, resource: Collection, operation: keyof Collection.Operations)
function getReader(adapter: OpraAdapter, resource: Singleton, operation: keyof Singleton.Operations)
function getReader(adapter: OpraAdapter, resource: Collection | Singleton, operation: any) {
  const opInstance: any = assertOperation(resource as any, operation);
  const objectCache = adapter[kObjectCache];
  const opStore = objectCache.get(opInstance) || {};
  objectCache.set(opInstance, opStore);
  opStore.jsonReader = opStore.jsonReader || createJsonReader({limit: opInstance.input?.maxContentSize});
  return opStore.jsonReader;
}

