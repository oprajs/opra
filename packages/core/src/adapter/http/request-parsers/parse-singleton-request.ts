import { BadRequestError, MethodNotAllowedError, OpraURL, Singleton } from '@opra/common';
import { Request } from '../../interfaces/request.interface.js';
import { RequestHost } from '../../request.host.js';
import { HttpServerRequest } from '../impl/http-server-request.js';

export async function parseSingletonRequest(
    incoming: HttpServerRequest,
    resource: Singleton,
    url: OpraURL
): Promise<Request> {
  if ((incoming.method === 'POST' || incoming.method === 'PATCH') &&
      incoming.headers['content-type'] !== 'application/json')
    throw new BadRequestError({message: 'Unsupported Content-Type'});

  url.searchParams.define({
    '$pick': {codec: 'string', array: 'strict'},
    '$omit': {codec: 'string', array: 'strict'},
    '$include': {codec: 'string', array: 'strict'}
  });
  url.parse(incoming.url || '');

  const contentId = incoming.headers['content-id'] as string;
  const params = url.searchParams;
  switch (incoming.method) {
    case 'POST': {
      const pick = params.get('$pick') as string;
      const omit = params.get('$omit') as string;
      const include = params.get('$include') as string;
      return new RequestHost({
        http: incoming,
        kind: 'SingletonCreateRequest',
        contentId,
        resource,
        operation: 'create',
        crud: 'create',
        many: false,
        args: {
          data: incoming.body,
          pick: pick && resource.normalizeFieldPath(pick),
          omit: omit && resource.normalizeFieldPath(omit),
          include: include && resource.normalizeFieldPath(include),
        }
      });
    }

    case 'DELETE': {
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
      const pick = params.get('$pick') as string;
      const omit = params.get('$omit') as string;
      const include = params.get('$include') as string;
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
      const pick = params.get('$pick') as string;
      const omit = params.get('$omit') as string;
      const include = params.get('$include') as string;
      return new RequestHost({
        http: incoming,
        kind: 'SingletonUpdateRequest',
        contentId,
        resource,
        operation: 'update',
        crud: 'update',
        many: false,
        args: {
          data: incoming.body,
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
