import { BadRequestError, Collection, MethodNotAllowedError, OpraURL } from '@opra/common';
import { Request } from '../../interfaces/request.interface.js';
import { RequestHost } from '../../request.host.js';
import { HttpServerRequest } from '../impl/http-server-request.js';

export async function parseCollectionRequest(
    incoming: HttpServerRequest,
    resource: Collection,
    url: OpraURL
): Promise<Request> {
  if ((incoming.method === 'POST' || incoming.method === 'PATCH') &&
      incoming.headers['content-type'] !== 'application/json')
    throw new BadRequestError({message: 'Unsupported Content-Type'});

  url.searchParams.define({
    '$search': {codec: 'string'},
    '$pick': {codec: 'string', array: 'strict'},
    '$omit': {codec: 'string', array: 'strict'},
    '$include': {codec: 'string', array: 'strict'},
    '$sort': {codec: 'string', array: 'strict'},
    '$filter': {codec: 'filter'},
    '$limit': {codec: 'number'},
    '$skip': {codec: 'number'},
    '$distinct': {codec: 'boolean'},
    '$count': {codec: 'boolean'},
  });
  url.parse(incoming.url || '');

  const contentId = incoming.headers['content-id'] as string;
  const p = url.path.get(0);
  const params = url.searchParams;
  switch (incoming.method) {
    case 'POST': {
      if (!p.key) {
        const pick = params.get('$pick') as string;
        const omit = params.get('$omit') as string;
        const include = params.get('$include') as string;
        return new RequestHost({
          http: incoming,
          kind: 'CollectionCreateRequest',
          contentId,
          resource,
          operation: 'create',
          crud: 'create',
          many: false,
          args: {
            data: incoming.body,
            pick: pick && resource.normalizeFieldPath(pick),
            omit: omit && resource.normalizeFieldPath(omit),
            include: include && resource.normalizeFieldPath(include)
          }
        });
      }
      break;
    }
    case 'DELETE': {
      if (p.key) {
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
      const pick = params.get('$pick') as string;
      const omit = params.get('$omit') as string;
      const include = params.get('$include') as string;
      if (p.key) {
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

      const filter = resource.normalizeFilter(params.get('$filter') as any);
      const sort = params.get('$sort') as string;
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
          limit: params.get('$limit'),
          skip: params.get('$skip'),
          distinct: params.get('$distinct'),
          count: params.get('$count'),
        }
      });
    }

    case 'PATCH': {
      if (p.key) {
        const pick = params.get('$pick') as string;
        const omit = params.get('$omit') as string;
        const include = params.get('$include') as string;
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
            data: incoming.body,
            pick: pick && resource.normalizeFieldPath(pick),
            omit: omit && resource.normalizeFieldPath(omit),
            include: include && resource.normalizeFieldPath(include),
          }
        });
      }
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
          data: incoming.body,
          filter,
        }
      });
    }
  }
  throw new MethodNotAllowedError({
    message: `Collection resource does not accept http "${incoming.method}" method`
  });
}
