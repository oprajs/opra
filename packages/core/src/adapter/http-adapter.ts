import { HeadersMap, HttpHeaders, HttpStatus } from '@opra/common';
import {
  BadRequestError,
  InternalServerError,
  IssueSeverity,
  MethodNotAllowedError,
  NotFoundError,
  OpraException,
  wrapException
} from '@opra/exception';
import {
  CollectionCreateQuery, CollectionDeleteManyQuery, CollectionDeleteQuery, CollectionGetQuery,
  CollectionResourceInfo, CollectionSearchQuery, CollectionUpdateManyQuery, CollectionUpdateQuery,
  ComplexType,
  ContainerResourceInfo,
  DataType,
  FieldGetQuery,
  IResourceContainer, OpraQuery,
  OpraSchema, SingletonGetQuery, SingletonResourceInfo, UnionType,
} from '@opra/schema';
import { OpraURL } from '@opra/url';
import { IHttpExecutionContext } from '../interfaces/execution-context.interface.js';
import { OpraAdapter } from './adapter.js';
import { QueryContext } from './query-context.js';

export namespace OpraHttpAdapter {
  export type Options = OpraAdapter.Options & {
    prefix?: string;
  }
}

interface PreparedOutput {
  status: number;
  headers: Record<string, string>;
  body?: any;
}

export class OpraHttpAdapter<TExecutionContext extends IHttpExecutionContext> extends OpraAdapter<IHttpExecutionContext> {

  protected prepareRequests(executionContext: TExecutionContext): QueryContext[] {
    const req = executionContext.getRequestWrapper();
    // todo implement batch requests
    if (this.isBatch(executionContext)) {
      throw new Error('not implemented yet');
    }
    const url = new OpraURL(req.getUrl());
    return [
      this.prepareRequest(
          executionContext,
          url,
          req.getMethod(),
          new HeadersMap(req.getHeaders()),
          req.getBody())
    ];
  }

  prepareRequest(
      executionContext: IHttpExecutionContext,
      url: OpraURL,
      method: string,
      headers: Map<string, string>,
      body?: any
  ): QueryContext {
    if (!url.path.size)
      throw new BadRequestError();
    if (method !== 'GET' && url.path.size > 1)
      throw new BadRequestError();
    const query = this.buildQuery(url, method, body);
    if (!query)
      throw new MethodNotAllowedError({
        message: `Method "${method}" is not allowed by target endpoint`
      });
    return new QueryContext({
      service: this.document,
      executionContext,
      query,
      headers: new HeadersMap(),
      params: url.searchParams,
      continueOnError: query.operation === 'read'
    });
  }

  buildQuery(url: OpraURL, method: string, body?: any): OpraQuery | undefined {
    const pathLen = url.path.size;
    let p = url.path.get(0);
    let resource = this._internalResources.get(p.resource) || this.document.getResource(p.resource);
    let container: IResourceContainer | undefined;

    let pathIndex = 0;
    while (resource && resource instanceof ContainerResourceInfo) {
      container = resource;
      p = url.path.get(++pathIndex);
      resource = container.getResource(p.resource);
    }

    try {
      method = method.toUpperCase();
      let query: OpraQuery | undefined;
      if (resource instanceof SingletonResourceInfo && !p.key) {
        switch (method) {
          case 'GET': {
            query = new SingletonGetQuery(resource);
          }
        }
      } else if (resource instanceof CollectionResourceInfo) {
        switch (method) {
          case 'GET': {
            if (p.key) {
              const searchParams = url.searchParams;
              query = new CollectionGetQuery(resource, p.key, {
                pick: searchParams.get('$pick'),
                omit: searchParams.get('$omit'),
                include: searchParams.get('$include')
              });
            } else {
              const searchParams = url.searchParams;
              query = new CollectionSearchQuery(resource, {
                filter: searchParams.get('$filter'),
                limit: searchParams.get('$limit'),
                skip: searchParams.get('$skip'),
                distinct: searchParams.get('$distinct'),
                count: searchParams.get('$count'),
                sort: searchParams.get('$sort'),
                pick: searchParams.get('$pick'),
                omit: searchParams.get('$omit'),
                include: searchParams.get('$include')
              });
            }
            break;
          }

          case 'DELETE': {
            const searchParams = url.searchParams;
            query = p.key
                ? new CollectionDeleteQuery(resource, p.key)
                : new CollectionDeleteManyQuery(resource, {
                  filter: searchParams.get('$filter'),
                });
            break;
          }

          case 'POST': {
            if (!p.key) {
              const searchParams = url.searchParams;
              query = new CollectionCreateQuery(resource, body, {
                pick: searchParams.get('$pick'),
                omit: searchParams.get('$omit'),
                include: searchParams.get('$include')
              });
            }
            break;
          }

          case 'PATCH': {
            if (p.key) {
              const searchParams = url.searchParams;
              query = new CollectionUpdateQuery(resource, p.key, body, {
                pick: searchParams.get('$pick'),
                omit: searchParams.get('$omit'),
                include: searchParams.get('$include')
              });
            } else {
              const searchParams = url.searchParams;
              query = new CollectionUpdateManyQuery(resource, body, {
                filter: searchParams.get('$filter')
              });
            }
            break;
          }
        }

      } else
        throw new InternalServerError();

      if (query instanceof SingletonGetQuery || query instanceof CollectionGetQuery || query instanceof FieldGetQuery) {
        // Move through properties
        let parentType: DataType;
        const curPath: string[] = [];
        let parent: SingletonGetQuery | CollectionGetQuery | FieldGetQuery = query;
        while (++pathIndex < pathLen) {
          p = url.path.get(pathIndex);
          parentType = parent.dataType;
          if (parent.dataType instanceof UnionType) {
            if (parent.dataType.name === 'any')
              parentType = this.document.getComplexDataType('object');
            else
              throw new TypeError(`"${resource.name}.${curPath.join()}" is a UnionType and needs type casting.`);
          }
          if (!(parentType instanceof ComplexType))
            throw new TypeError(`"${resource.name}.${curPath.join()}" is not a ComplexType and has no fields.`);
          curPath.push(p.resource);
          parent.child = new FieldGetQuery(parent, p.resource, {castingType: parentType});
          parent = parent.child;

        }
      }

      return query;

    } catch (e: any) {
      if (e instanceof OpraException)
        throw e;
      throw new BadRequestError(e);
    }
  }

  protected async sendResponse(executionContext: TExecutionContext, queryContexts: QueryContext[]) {

    const outputPackets: PreparedOutput[] = [];
    for (const ctx of queryContexts) {
      const v = this.createOutput(ctx);
      outputPackets.push(v);
    }

    if (this.isBatch(executionContext)) {
      // this.writeError([], new InternalServerError({message: 'Not implemented yet'}));
      return;
    }

    if (!outputPackets.length)
      return this.sendError(executionContext, new NotFoundError());

    const out = outputPackets[0];
    const resp = executionContext.getResponseWrapper();

    resp.setStatus(out.status);
    resp.setHeader(HttpHeaders.Content_Type, 'application/json');
    resp.setHeader(HttpHeaders.Cache_Control, 'no-cache');
    resp.setHeader(HttpHeaders.Pragma, 'no-cache');
    resp.setHeader(HttpHeaders.Expires, '-1');
    resp.setHeader(HttpHeaders.X_Opra_Version, OpraSchema.Version);
    if (out.headers) {
      for (const [k, v] of Object.entries(out.headers)) {
        resp.setHeader(k, v);
      }
    }
    resp.send(JSON.stringify(out.body));
    resp.end();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected isBatch(executionContext: TExecutionContext): boolean {
    return false;
  }

  protected createOutput(ctx: QueryContext): PreparedOutput {
    const {query} = ctx;
    let body: any;
    let status = ctx.status || 0;

    const errors = ctx.errors.map(e => wrapException(e));

    if (errors && errors.length) {
      // Sort errors from fatal to info
      errors.sort((a, b) => {
        const i = IssueSeverity.Keys.indexOf(a.issue.severity) - IssueSeverity.Keys.indexOf(b.issue.severity);
        if (i === 0)
          return b.status - a.status;
        return i;
      });
      if (!status || status < HttpStatus.BAD_REQUEST) {
        status = errors[0].status;
        if (status < HttpStatus.BAD_REQUEST)
          status = HttpStatus.INTERNAL_SERVER_ERROR;
      }
      body = {
        operation: ctx.query.method,
        errors: errors.map(e => e.issue)
      }
    } else {
      body = ctx.response;
      status = status || (query.operation === 'create' ? HttpStatus.CREATED : HttpStatus.OK);
    }

    body = this.i18n.deep(body);
    return {
      status,
      headers: ctx.responseHeaders.toObject(),
      body
    }
  }

  protected async sendError(executionContext: TExecutionContext, error: OpraException) {
    const resp = executionContext.getResponseWrapper();
    resp.setStatus(error.status || 500);
    resp.setHeader(HttpHeaders.Content_Type, 'application/json');
    resp.setHeader(HttpHeaders.Cache_Control, 'no-cache');
    resp.setHeader(HttpHeaders.Pragma, 'no-cache');
    resp.setHeader(HttpHeaders.Expires, '-1');
    resp.setHeader(HttpHeaders.X_Opra_Version, OpraSchema.Version);
    const issue = this.i18n.deep(error.issue);
    const body = {
      operation: 'unknown',
      errors: [issue]
    };
    resp.send(JSON.stringify(body));
  }


}
