import { Readable } from 'stream';
import {
  BadRequestError, Collection, HttpHeaderCodes, HttpHeaders, HttpStatusCodes,
  InternalServerError, isReadable, IssueSeverity, MethodNotAllowedError, normalizeHeaders,
  OpraException, OpraSchema, OpraURL, Singleton, wrapException
} from '@opra/common';
import { OpraAdapter } from '../adapter.js';
import { HttpExecutionContext } from '../interfaces/execution-context.interface.js';
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
} from '../query/index.js';
import { QueryRequestContext } from '../request-context/query-request-context.js';
import { RequestContext } from '../request-context/request-context.js';

export namespace OpraHttpAdapter {
  export type Options = OpraAdapter.Options & {
    prefix?: string;
  }
}

interface PreparedOutput {
  status: number;
  headers: HttpHeaders;
  body?: string | Readable | Buffer;
}

export abstract class OpraHttpAdapter<TExecutionContext extends HttpExecutionContext = HttpExecutionContext> extends OpraAdapter<TExecutionContext> {

  async parse(executionContext: TExecutionContext): Promise<RequestContext> {
    const req = executionContext.getRequest();
    const contentType = req.getHeader('content-type');

    if (!contentType || contentType === 'application/json') {
      const body = req.getBody();
      const url = new OpraURL(req.getUrl());
      return this.parseQuery({
        executionContext,
        url,
        method: req.getMethod(),
        headers: req.getHeaders(),
        body
      });
    }

    if (typeof contentType === 'string' && contentType.startsWith('multipart/mixed')) {
      // const m = BOUNDARY_PATTERN.exec(contentType);
      // if (!m)
      //   throw new BadRequestError({message: 'Content-Type header does not match required format'});
      // const url = new OpraURL(req.getUrl());
      // return await this.parseMultiPart(executionContext, url, req.getHeaders(), req.getStream(), m[1]);
    }

    throw new BadRequestError({message: 'Unsupported Content-Type'});
  }

  parseQuery(args: {
               executionContext: HttpExecutionContext,
               url: OpraURL,
               method: string,
               headers: any,
               body?: any;
               contentId?: string
             }
  ): QueryRequestContext {
    const {executionContext, url, method, headers, body, contentId} = args;
    if (!url.path.size)
      throw new BadRequestError();
    if (method !== 'GET' && url.path.size > 1)
      throw new BadRequestError();
    const query = this.buildQuery(url, method, body);
    if (!query)
      throw new MethodNotAllowedError({
        message: `Method "${method}" is not allowed by target endpoint`
      });
    return new QueryRequestContext({
      document: this.document,
      executionContext,
      headers,
      query,
      params: url.searchParams,
      contentId,
      continueOnError: query.operation === 'read'
    });
  }

  // async parseMultiPart(
  //     executionContext: TExecutionContext,
  //     url: OpraURL,
  //     headers: IncomingHttpHeaders,
  //     input: Readable,
  //     boundary: string
  // ): Promise<BatchRequestContext> {
  //   return await new Promise((resolve, reject) => {
  //     let _resolved = false;
  //     const dicer = new Dicer({boundary});
  //     const doReject = (e) => {
  //       if (_resolved) return;
  //       _resolved = true;
  //       reject(e);
  //       taskQueue.clearQueue();
  //       dicer.destroy();
  //     }
  //     const taskQueue = new TaskQueue({concurrency: 1});
  //     taskQueue.on('error', doReject);
  //
  //     const queries: SingleRequestContext[] = [];
  //     let partCounter = 0;
  //     dicer.on('error', doReject);
  //     dicer.on('part', part => {
  //       const partIndex = partCounter++;
  //       let header: any;
  //       const chunks: Buffer[] = [];
  //       part.on('error', doReject);
  //       part.on('header', (_header) => header = normalizeHeaders(_header));
  //       part.on('data', (chunk: Buffer) => chunks.push(chunk));
  //       part.on('end', () => {
  //         if (_resolved || !(header || chunks.length))
  //           return;
  //         const ct = header['content-type'];
  //         if (ct === 'application/http') {
  //           taskQueue.enqueue(async () => {
  //             const data = Buffer.concat(chunks);
  //             if (!(data && data.length))
  //               return;
  //             const r = HttpRequest.parse(data);
  //             await callMiddlewares(r, [jsonBodyParser]);
  //             const subUrl = new OpraURL(r.url);
  //             const contentId = header && header['content-id'];
  //             queries.push(this.parseSingleQuery({
  //               executionContext,
  //               url: subUrl,
  //               method: r.method,
  //               headers: r.headers,
  //               body: r.body,
  //               contentId
  //             }));
  //           });
  //         } else doReject(new BadRequestError({
  //           message: 'Unaccepted "content-type" header in multipart data',
  //           details: {
  //             position: `${boundary}[${partIndex}]`
  //           }
  //         }))
  //       });
  //     });
  //     dicer.on('finish', () => {
  //       taskQueue.enqueue(() => {
  //         if (_resolved) return;
  //         _resolved = true;
  //         const batch = new BatchRequestContext({
  //           service: this.document,
  //           executionContext,
  //           headers,
  //           queries,
  //           params: url.searchParams,
  //           continueOnError: false
  //         });
  //         resolve(batch);
  //       });
  //     });
  //     input.pipe(dicer);
  //   });
  // }

  buildQuery(url: OpraURL, method: string, body?: any): OpraQuery | undefined {
    // const pathLen = url.path.size;
    // let pathIndex = 0;
    const p = url.path.get(0);
    const resource = this._internalDoc.getResource(p.resource);
    // let container: IResourceContainer | undefined;
    // while (resource && resource instanceof ContainerResourceInfo) {
    //   container = resource;
    //   p = url.path.get(++pathIndex);
    //   resource = container.getResource(p.resource);
    // }

    try {
      method = method.toUpperCase();
      let query: OpraQuery | undefined;
      const searchParams = url.searchParams;
      if (resource instanceof Singleton && !p.key) {
        switch (method) {
          case 'POST': {
            query = new SingletonCreateQuery(resource, body, {
              pick: searchParams.get('$pick'),
              omit: searchParams.get('$omit'),
              include: searchParams.get('$include')
            });
            break;
          }
          case 'DELETE': {
            query = new SingletonDeleteQuery(resource);
            break;
          }
          case 'GET': {
            query = new SingletonGetQuery(resource, {
              pick: searchParams.get('$pick'),
              omit: searchParams.get('$omit'),
              include: searchParams.get('$include')
            });
            break;
          }
          case 'PATCH': {
            query = new SingletonUpdateQuery(resource, body, {
              pick: searchParams.get('$pick'),
              omit: searchParams.get('$omit'),
              include: searchParams.get('$include')
            });
            break;
          }
        }
      } else if (resource instanceof Collection) {
        switch (method) {
          case 'POST': {
            if (!p.key) {
              query = new CollectionCreateQuery(resource, body, {
                pick: searchParams.get('$pick'),
                omit: searchParams.get('$omit'),
                include: searchParams.get('$include')
              });
            }
            break;
          }

          case 'DELETE': {
            query = p.key
                ? new CollectionDeleteQuery(resource, p.key)
                : new CollectionDeleteManyQuery(resource, {
                  filter: searchParams.get('$filter'),
                });
            break;
          }

          case 'GET': {
            if (p.key) {
              query = new CollectionGetQuery(resource, p.key, {
                pick: searchParams.get('$pick'),
                omit: searchParams.get('$omit'),
                include: searchParams.get('$include')
              });
            } else {
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

          case 'PATCH': {
            if (p.key) {
              query = new CollectionUpdateQuery(resource, p.key, body, {
                pick: searchParams.get('$pick'),
                omit: searchParams.get('$omit'),
                include: searchParams.get('$include')
              });
            } else {
              query = new CollectionUpdateManyQuery(resource, body, {
                filter: searchParams.get('$filter')
              });
            }
            break;
          }
        }

      } else
        throw new InternalServerError();

      // if (query instanceof SingletonGetQuery || query instanceof CollectionGetQuery || query instanceof ElementReadQuery) {
      //   // Move through properties
      //   let parentType: DataType;
      //   const curPath: string[] = [];
      //   let parent: SingletonGetQuery | CollectionGetQuery | ElementReadQuery = query;
      //   while (++pathIndex < pathLen) {
      //     p = url.path.get(pathIndex);
      //     parentType = parent.type;
      //     if (parent.type instanceof UnionType) {
      //       if (parent.type.name === 'any')
      //         parentType = this.document.getComplexType('object');
      //       else
      //         throw new TypeError(`"${resource.name}.${curPath.join()}" is a UnionType and needs type casting.`);
      //     }
      //     if (!(parentType instanceof ComplexType))
      //       throw new TypeError(`"${resource.name}.${curPath.join()}" is not a ComplexType and has no fields.`);
      //     curPath.push(p.resource);
      //     parent.child = new ElementReadQuery(parent, p.resource, {castingType: parentType});
      //     parent = parent.child;
      //   }
      // }

      return query;

    } catch (e: any) {
      if (e instanceof OpraException)
        throw e;
      throw new BadRequestError(e);
    }
  }

  protected async sendResponse(executionContext: TExecutionContext, requestContext: RequestContext) {
    // if (requestContext instanceof BatchRequestContext)
    //   return this.sendBatchResponse(executionContext, requestContext);
    if (requestContext instanceof QueryRequestContext)
      return this.sendSingleResponse(executionContext, requestContext);
    /* istanbul ignore next */
    throw new TypeError('Invalid request context instance');
  }

  // protected async sendBatchResponse(executionContext: TExecutionContext, requestContext: BatchRequestContext) {
  //   const resp = executionContext.getResponse();
  //   resp.setStatus(HttpStatus.OK);
  //   resp.setHeader(HttpHeaderCodes.Cache_Control, 'no-cache');
  //   resp.setHeader(HttpHeaderCodes.Pragma, 'no-cache');
  //   resp.setHeader(HttpHeaderCodes.Expires, '-1');
  //   if (requestContext.headers) {
  //     for (const [k, v] of Object.entries(requestContext.headers)) {
  //       if (v)
  //         resp.setHeader(k, v);
  //     }
  //   }
  //   const boundary = 'batch_' + uuid();
  //   resp.setHeader(HttpHeaderCodes.Content_Type, 'multipart/mixed;boundary=' + boundary);
  //   resp.setHeader(HttpHeaderCodes.X_Opra_Version, OpraSchema.Version);
  //
  //   const bodyBuilder = new HttpMultipartData();
  //
  //   const chunks: any[] = [];
  //   let msgIdx = 0;
  //   for (const ctx of requestContext.queries) {
  //     msgIdx++;
  //     const out = this.createOutput(ctx);
  //
  //
  //     // chunks.push('--' + boundary + CRLF);
  //     // let s = 'Content-Type: application/http' + CRLF +
  //     //     'Content-Transfer-Encoding: binary' + CRLF +
  //     //     'Content-ID:' + (ctx.contentId || msgIdx) + CRLF +
  //     //     CRLF +
  //     //     'HTTP/1.1 ' + out.status + (HttpStatus[out.status] || 'Unknown') + CRLF;
  //
  //     let body = out.body;
  //     const headers = out.headers || {};
  //     if (body) {
  //       const contentType = String(headers['content-type'] || '').split(/\s*;\s*/);
  //       let charset = '';
  //       if (Highland.isStream(body)) {
  //         const l = parseInt(String(headers['content-length']), 10);
  //         if (isNaN(l))
  //           throw new TypeError('"content-length" header required for streamed responses');
  //       } else if (typeof body === 'object') {
  //         if (typeof body.stream === 'function') { // File and Blob
  //           contentType[0] = body.type || 'binary';
  //           headers['content-length'] = String(body.size);
  //           body = body.stream();
  //         } else if (Buffer.isBuffer(body)) {
  //           headers['content-length'] = String(body.length);
  //         } else {
  //           contentType[0] = contentType[0] || 'application/json';
  //           charset = 'utf-8';
  //           body = Buffer.from(JSON.stringify(body), 'utf-8');
  //           headers['content-length'] = String(body.length);
  //         }
  //       } else {
  //         contentType[0] = contentType[0] || 'text/plain';
  //         charset = 'utf-8';
  //         body = Buffer.from(String(body), 'utf-8');
  //         headers['content-length'] = String(body.length);
  //       }
  //       if (contentType[0]) {
  //         if (charset) {
  //           const i = contentType.findIndex(x => CHARSET_PATTERN.test(String(x)));
  //           if (i > 0) contentType[i] = 'charset=' + charset;
  //           else contentType.join('charset=' + charset);
  //         }
  //         headers['content-type'] = contentType.join(';');
  //       }
  //     }
  //     for (const [k, v] of Object.entries(headers))
  //       s += k + ': ' + (Array.isArray(v) ? v.join(';') : v) + CRLF
  //
  //     chunks.push(s + CRLF);
  //
  //     if (body) {
  //       if (typeof body === 'string')
  //         chunks.push(body + CRLF + CRLF);
  //       else {
  //         chunks.push(body);
  //         chunks.push(CRLF + CRLF);
  //       }
  //     }
  //   }
  //
  //   chunks.push('--' + boundary + '--' + CRLF);
  //
  //   resp.setHeader('content-type', 'multipart/mixed;boundary=' + boundary);
  //   resp.send(Highland(chunks).flatten());
  //   resp.end();
  // }

  protected async sendSingleResponse(executionContext: TExecutionContext, requestContext: QueryRequestContext) {
    const out = this.createOutput(requestContext);

    const resp = executionContext.getResponse();
    resp.setStatus(out.status);
    resp.setHeader(HttpHeaderCodes.Cache_Control, 'no-cache');
    resp.setHeader(HttpHeaderCodes.Pragma, 'no-cache');
    resp.setHeader(HttpHeaderCodes.Expires, '-1');
    if (out.headers) {
      for (const [k, v] of out.headers.entries()) {
        if (v)
          resp.setHeader(k, v);
      }
    }
    resp.setHeader(HttpHeaderCodes.X_Opra_Version, OpraSchema.SpecVersion);
    if (out.body)
      resp.send(out.body);
    resp.end();
  }

  protected createOutput(ctx: QueryRequestContext): PreparedOutput {
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
      if (!status || status < HttpStatusCodes.BAD_REQUEST) {
        status = errors[0].status;
        if (status < HttpStatusCodes.BAD_REQUEST)
          status = HttpStatusCodes.INTERNAL_SERVER_ERROR;
      }
      body = this.i18n.deep({
        operation: ctx.query.method,
        errors: errors.map(e => e.issue)
      });
      body = JSON.stringify(body);
      ctx.responseHeaders.set(HttpHeaderCodes.Content_Type, 'application/json; charset=utf-8');
    } else {
      if (typeof ctx.response === 'object' && !(isReadable(ctx.response) || Buffer.isBuffer(ctx.response))) {
        body = this.i18n.deep(ctx.response);
        body = JSON.stringify(body);
        ctx.responseHeaders.set(HttpHeaderCodes.Content_Type, 'application/json; charset=utf-8');
      }
      status = status || (query.operation === 'create' ? HttpStatusCodes.CREATED : HttpStatusCodes.OK);
    }

    ctx.responseHeaders.sort();

    return {
      status,
      headers: ctx.responseHeaders,
      body
    }
  }

  protected async sendError(executionContext: TExecutionContext, error: OpraException) {
    const resp = executionContext.getResponse();
    resp.setStatus(error.status || 500);
    resp.setHeader(HttpHeaderCodes.Content_Type, 'application/json');
    resp.setHeader(HttpHeaderCodes.Cache_Control, 'no-cache');
    resp.setHeader(HttpHeaderCodes.Pragma, 'no-cache');
    resp.setHeader(HttpHeaderCodes.Expires, '-1');
    resp.setHeader(HttpHeaderCodes.X_Opra_Version, OpraSchema.SpecVersion);
    const issue = this.i18n.deep(error.issue);
    const body = {
      operation: 'unknown',
      errors: [issue]
    };
    resp.send(JSON.stringify(body));
  }

}
