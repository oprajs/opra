import { ApiDocument, BadRequestError, Collection, Singleton } from '@opra/common';
import { Request } from '../../interfaces/request.interface.js';
import { HttpServerRequest } from '../impl/http-server-request.js';
import { parseCollectionRequest } from './parse-collection-request.js';
import { parseSingletonRequest } from './parse-singleton-request.js';

export async function parseRequest(api: ApiDocument, incoming: HttpServerRequest): Promise<Request> {
  const {parsedUrl} = incoming;
  if (!parsedUrl.path.length) {
    // Batch
    if (incoming.headers['content-type'] === 'multipart/mixed') {
      // todo
    }
    throw new BadRequestError();
  }
  const p = parsedUrl.path[0];
  const resource = api.getResource(p.resource);
  if (resource instanceof Collection)
    return await parseCollectionRequest(incoming, resource, parsedUrl);
  if (resource instanceof Singleton)
    return await parseSingletonRequest(incoming, resource, parsedUrl);
  throw new BadRequestError();
}
