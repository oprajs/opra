import _ from 'lodash';
import { ApiException, BadRequestException, HttpStatus, OpraQueryNode, } from '@opra/common';
import { OpraURL } from '@opra/url';
import { HttpRequest, HttpResponse } from '../interfaces';
import { OpraAdapter } from './adapter.js';

export interface HttpExecutionContext {
  request: HttpRequest;
  response: HttpResponse;
}

export class OpraHttpAdapter<TContext extends HttpExecutionContext> extends OpraAdapter<HttpExecutionContext> {

  protected async sendResponse(context: TContext, query: OpraQueryNode) {
    let status = query.status;
    if (!status) {
      status = query.operation === 'create' ? HttpStatus.CREATED : HttpStatus.OK;
      if (query.errors) {
        for (const e of query.errors as ApiException[]) {
          status = Math.max(status, e.status || status);
        }
        if (status < HttpStatus.BAD_REQUEST)
          status = HttpStatus.INTERNAL_SERVER_ERROR;
      }
    }

    if (query.returnHeaders) {
      for (const [k, v] of Object.entries(query.returnHeaders)) {
        context.response.setHeader(k, v);
      }
    }

    const body = {
      '@resource': query.resourceName,
      data: query.returnValue ? this.i18n.deep(query.returnValue) :
          query.intent === 'collection' ? [] : null,
      etag: query.returnEtag,
      total: query.returnTotal,
      errors: query.errors
    };
    Object.assign(body, _.omit(query.returnExtra, Object.keys(body)));

    context.response.setStatus(status)
        .setHeader('Content-Type', 'application/json')
        .send(JSON.stringify(body));
  }

  protected buildQuery(context: TContext): OpraQueryNode {
    const req = context.request;
    const url = new OpraURL(req.url);
    if (!url.path.size)
      throw new BadRequestException();
    if (req.method !== 'GET' && url.path.size > 1)
      throw new BadRequestException();

    const rootPath = url.path.get(0);
    let curPath = '';
    const root: OpraQueryNode = {
      operation: req.method === 'GET'
          ? 'read'
          : (req.method === 'POST'
              ? 'create'
              : (req.method === 'PUT' ? 'update' : 'patch')),
      intent: rootPath.key ? 'instance' : 'collection',
      resourceName: rootPath.resource,
      resourceKey: rootPath.key,
      returnType: String,
      path: curPath
    }

    let node: OpraQueryNode = root;
    for (let i = 1; i < url.path.size - 1; i++) {
      const p = url.path.get(i);
      if (p.key)
        throw new BadRequestException();
      curPath = (curPath ? '.' : '') + p.resource;
      node = {
        parent: node,
        operation: node.operation,
        intent: 'property',
        resourceName: p.resource,
        returnType: String,
        path: curPath
      }
    }
    return root;
  }

}
