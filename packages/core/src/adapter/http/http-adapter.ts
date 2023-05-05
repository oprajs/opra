import { Task } from 'power-tasks';
import {
  BadRequestError, Collection, Expression, HttpHeaderCodes, HttpRequestMessage, HttpResponseMessage,
  HttpStatusCodes, InternalServerError, isReadable, IssueSeverity, MethodNotAllowedError,
  OpraException, OpraSchema, OpraURL, Singleton, wrapException
} from '@opra/common';
import { OpraAdapter } from '../adapter.js';
import { ILogger } from '../interfaces/logger.interface.js';
import { Request } from '../interfaces/request.interface.js';
import { RequestContext } from '../interfaces/request-context.interface.js';
import { Response } from '../interfaces/response.interface.js';
import { HttpRequestHost } from './http-request.host.js';
import { HttpRequestContextHost } from './http-request-context.host.js';
import { HttpResponseHost } from './http-response.host.js';

/**
 * @namespace OpraHttpAdapter
 */
export namespace OpraHttpAdapter {
  export type Options = OpraAdapter.Options & {
    prefix?: string;
  }
}

/**
 *
 * @class OpraHttpAdapter
 */
export abstract class OpraHttpAdapter extends OpraAdapter {

  protected abstract platform: string;

  /**
   * Main http request handler
   * @param incoming
   * @param outgoing
   * @protected
   */
  protected async handler(incoming: HttpRequestMessage, outgoing: HttpResponseMessage): Promise<void> {
    try {
      // Batch
      if (incoming.is('multipart/mixed')) {
        throw new BadRequestError({message: 'Not implemented yet'});
      }

      if (!(incoming.method === 'POST' || incoming.method === 'PATCH') || incoming.is('json')) {
        const request = await this.parseRequest(incoming);
        const response: Response = new HttpResponseHost({}, outgoing);
        const context = new HttpRequestContextHost(this.platform, this.api, request, response);
        const task = new Task(
            async () => {
              try {
                await this.executeRequest(context);
                if (request.operation === 'findMany' && request.args.count && response.count != null) {
                  response.switchToHttp().header(HttpHeaderCodes.X_Opra_Total_Matches, String(response.count));
                }
              } catch (error: any) {
                return this.errorHandler(incoming, outgoing, [error]);
              }
              await this.sendResponse(context);
            },
            {
              id: incoming.get('content-id'),
              exclusive: request.crud !== 'read'
            });
        await task.toPromise().catch(e => {
          this.logger?.error?.(e);
          outgoing.sendStatus(500);
        });
        await this.emitAsync('request-finish', context);
        return;
      }
      throw new BadRequestError({message: 'Unsupported Content-Type'});
    } catch (error) {
      await this.errorHandler(incoming, outgoing, [error]);
    }
  }

  protected async errorHandler(incoming: HttpRequestMessage, outgoing: HttpResponseMessage, errors: any[]): Promise<void> {
    errors.forEach(e => {
      this.log((e instanceof OpraException) ? 'error' : 'fatal', incoming, e); // todo. implement a better logger
    });
    errors = errors.map(wrapException);
    let status = outgoing.statusCode || 0;

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
    const body = this.i18n.deep({
      errors: errors.map(e => e.issue)
    });
    outgoing.set(HttpHeaderCodes.Content_Type, 'application/json; charset=utf-8');
    outgoing.set(HttpHeaderCodes.Cache_Control, 'no-cache');
    outgoing.set(HttpHeaderCodes.Pragma, 'no-cache');
    outgoing.set(HttpHeaderCodes.Expires, '-1');
    outgoing.set(HttpHeaderCodes.X_Opra_Version, OpraSchema.SpecVersion);
    outgoing.status(status);
    outgoing.send(JSON.stringify(body));
    outgoing.end();
  }

  protected log(logType: keyof ILogger, incoming: HttpRequestMessage, message: string, ...optionalParams: any[]) {
    const logFn = logType === 'fatal'
        ? this.logger?.fatal || this.logger?.error
        : this.logger?.[logType];
    if (!logFn)
      return;
    logFn.apply(this.logger, [String(message), ...optionalParams]);
  }

  protected async executeRequest(context: RequestContext): Promise<void> {
    await super.executeRequest(context);
    const {request} = context;
    const response = context.response;
    const {crud} = request;
    const httpResponse = response.switchToHttp();
    if (request.resource instanceof Singleton || request.resource instanceof Collection) {
      httpResponse.set(HttpHeaderCodes.X_Opra_Data_Type, request.resource.type.name);
      httpResponse.set(HttpHeaderCodes.X_Opra_Operation, request.operation);
    }
    if (crud === 'create') {
      if (!response.value)
        throw new InternalServerError();
      // todo validate
      httpResponse.status(201);
    }
  }

  /**
   *
   * @param incoming
   * @protected
   */
  protected async parseRequest(incoming: HttpRequestMessage): Promise<Request> {
    try {
      const url = new OpraURL();
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
      url.parse(incoming.url);

      // const {context, url, method, headers, body, contentId} = args;
      if (!url.path.size)
        throw new BadRequestError();

      const method = incoming.method;
      if (method !== 'GET' && url.path.size > 1)
        throw new BadRequestError();

      // const pathLen = url.path.size;
      // let pathIndex = 0;
      const params = url.searchParams;
      const p = url.path.get(0);
      const resource = this._internalDoc.getResource(p.resource);
      // let container: IResourceContainer | undefined;
      // while (resource && resource instanceof ContainerResourceInfo) {
      //   container = resource;
      //   p = url.path.get(++pathIndex);
      //   resource = container.getResource(p.resource);
      // }

      // const headers = incoming.headers;

      /*
       * Collection
       */
      if (resource instanceof Collection) {
        switch (method) {
          case 'POST': {
            if (!p.key) {
              const pick = params.get('$pick') as string;
              const omit = params.get('$omit') as string;
              const include = params.get('$include') as string;
              return new HttpRequestHost({
                kind: 'CollectionCreateRequest',
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
              }, incoming);
            }
            break;
          }

          case 'DELETE': {
            if (p.key) {
              return new HttpRequestHost({
                kind: 'CollectionDeleteRequest',
                resource,
                operation: 'delete',
                crud: 'delete',
                many: false,
                args: {
                  key: resource.parseKeyValue(p.key)
                }
              }, incoming);
            }
            const filter = params.get('$filter') as Expression;
            return new HttpRequestHost({
              kind: 'CollectionDeleteManyRequest',
              resource,
              operation: 'deleteMany',
              crud: 'delete',
              many: true,
              args: {
                filter: filter && resource.normalizeFilter(filter)
              }
            }, incoming);
          }

          case 'GET': {
            const pick = params.get('$pick') as string;
            const omit = params.get('$omit') as string;
            const include = params.get('$include') as string;
            if (p.key) {
              return new HttpRequestHost({
                kind: 'CollectionGetRequest',
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
              }, incoming);
            }

            const filter = params.get('$filter') as Expression;
            const sort = params.get('$sort') as string;
            return new HttpRequestHost({
              kind: 'CollectionFindManyRequest',
              resource,
              operation: 'findMany',
              crud: 'read',
              many: true,
              args: {
                pick: pick && resource.normalizeFieldPath(pick),
                omit: omit && resource.normalizeFieldPath(omit),
                include: include && resource.normalizeFieldPath(include),
                sort: sort && resource.normalizeSortFields(sort),
                filter: filter && resource.normalizeFilter(filter),
                limit: params.get('$limit'),
                skip: params.get('$skip'),
                distinct: params.get('$distinct'),
                count: params.get('$count'),
              }
            }, incoming);
          }

          case 'PATCH': {
            if (p.key) {
              const pick = params.get('$pick') as string;
              const omit = params.get('$omit') as string;
              const include = params.get('$include') as string;
              return new HttpRequestHost({
                kind: 'CollectionUpdateRequest',
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
              }, incoming);
            }
            const filter = params.get('$filter') as Expression;
            return new HttpRequestHost({
              kind: 'CollectionUpdateManyRequest',
              resource,
              operation: 'updateMany',
              crud: 'update',
              many: true,
              args: {
                data: incoming.body,
                filter: filter && resource.normalizeFilter(filter),
              }
            }, incoming);
          }
          default:
            throw new BadRequestError()
        }

      } else
          /*
           * Singleton
           */
      if (resource instanceof Singleton) {
        if (p.key)
          throw new BadRequestError();
        switch (method) {
          case 'POST': {
            const pick = params.get('$pick') as string;
            const omit = params.get('$omit') as string;
            const include = params.get('$include') as string;
            return new HttpRequestHost({
              kind: 'SingletonCreateRequest',
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
            }, incoming);
          }
          case 'DELETE': {
            return new HttpRequestHost({
              kind: 'SingletonDeleteRequest',
              resource,
              operation: 'delete',
              crud: 'delete',
              many: false,
              args: {}
            }, incoming);
          }
          case 'GET': {
            const pick = params.get('$pick') as string;
            const omit = params.get('$omit') as string;
            const include = params.get('$include') as string;
            return new HttpRequestHost({
              kind: 'SingletonGetRequest',
              resource,
              operation: 'get',
              crud: 'read',
              many: false,
              args: {
                pick: pick && resource.normalizeFieldPath(pick),
                omit: omit && resource.normalizeFieldPath(omit),
                include: include && resource.normalizeFieldPath(include),
              }
            }, incoming);
          }
          case 'PATCH': {
            const pick = params.get('$pick') as string;
            const omit = params.get('$omit') as string;
            const include = params.get('$include') as string;
            return new HttpRequestHost({
              kind: 'SingletonUpdateRequest',
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
            }, incoming);
          }
          default:
            throw new BadRequestError()
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

      throw new MethodNotAllowedError({
        message: `Method "${method}" is not allowed by target endpoint`
      });

    } catch (e: any) {
      if (e instanceof OpraException)
        throw e;
      throw new BadRequestError(e);
    }
  }

  // async parseMultiPart(
  //     context: TExecutionContext,
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
  //               context,
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
  //           context,
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

  protected async sendResponse(context: RequestContext) {
    const {request, response} = context;
    const outgoing = response.switchToHttp();

    const errors = response.errors?.map(e => wrapException(e));
    if (errors && errors.length) {
      await this.errorHandler(request.switchToHttp(), outgoing, errors);
      return;
    }

    outgoing.set(HttpHeaderCodes.Cache_Control, 'no-cache');
    outgoing.set(HttpHeaderCodes.Pragma, 'no-cache');
    outgoing.set(HttpHeaderCodes.Expires, '-1');
    outgoing.set(HttpHeaderCodes.X_Opra_Version, OpraSchema.SpecVersion);
    outgoing.status(outgoing.statusCode || HttpStatusCodes.OK);
    if (response.value) {
      if (typeof response.value === 'object') {
        if (isReadable(response.value) || Buffer.isBuffer(response.value))
          outgoing.send(response.value);
        else {
          const body = this.i18n.deep(response.value);
          outgoing.set(HttpHeaderCodes.Content_Type, 'application/json; charset=utf-8');
          outgoing.send(JSON.stringify(body));
        }
      } else outgoing.send(JSON.stringify(response.value));
    }
    outgoing.end();
  }

  // protected async sendBatchResponse(context: TExecutionContext, requestContext: BatchRequestContext) {
  //   const resp = context.getResponse();
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

}
