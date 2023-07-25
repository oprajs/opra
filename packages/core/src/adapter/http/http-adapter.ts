import http from 'http';
import { Task } from 'power-tasks';
import {
  ApiDocument,
  BadRequestError, Collection, HttpHeaderCodes,
  HttpStatusCodes, HttpStatusMessages, InternalServerError, isReadable,
  IssueSeverity,
  OpraException, OpraSchema, OpraURL, OpraURLPath,
  wrapException
} from '@opra/common';
import { OpraAdapter } from '../adapter.js';
import { ILogger } from '../interfaces/logger.interface.js';
import { Request } from '../interfaces/request.interface.js';
import { RequestContext } from '../interfaces/request-context.interface.js';
import { Response } from '../interfaces/response.interface.js';
import { RequestContextHost } from '../request-context.host.js';
import { ResponseHost } from '../response.host.js';
import { HttpServerRequest } from './impl/http-server-request.js';
import { HttpServerResponse } from './impl/http-server-response.js';
import { parseRequest } from './request-parsers/parse-request.js';

/**
 * @namespace OpraHttpAdapter
 */
export namespace OpraHttpAdapter {
  export type Options = OpraAdapter.Options & {
    basePath?: string;
  }
}

/**
 *
 * @class OpraHttpAdapterBase
 */
export abstract class OpraHttpAdapterBase extends OpraAdapter {

  protected platform: string = 'node';

  /**
   * Main http request handler
   * @param incoming
   * @param outgoing
   * @protected
   */
  protected async handler(incoming: HttpServerRequest, outgoing: HttpServerResponse): Promise<void> {
    try {
      try {
        const request = await parseRequest(this._apiRoot, incoming);
        const task = this.createRequestTask(request, outgoing);
        await task.toPromise();
      } catch (e: any) {
        if (e instanceof OpraException)
          throw e;
        throw new BadRequestError(e);
      }
    } catch (error) {
      await this.handleError(incoming, outgoing, [error]);
    }
  }

  protected createRequestTask(request: Request, outgoing: HttpServerResponse): Task {
    return new Task(
        async () => {
          const response: Response = new ResponseHost({http: outgoing});
          const context =
              new RequestContextHost('http', this.platform, this.api, request, response);
          return this.executeRequest(context);
        },
        {
          id: request.contentId,
          exclusive: request.crud !== 'read'
        });
  }

  protected async executeRequest(context: RequestContext): Promise<void> {
    const {request, response} = context;
    await super.executeRequest(context)
        .catch(e => {
          response.errors = response.errors || [];
          response.errors.push(e);
        });
    const outgoing = response.switchToHttp();

    if (response.errors?.length) {
      const errors = response.errors.map(e => wrapException(e));
      await this.handleError(request.switchToHttp(), outgoing, errors);
      return;
    }

    if (request.crud === 'create') {
      if (!response.value)
        throw new InternalServerError();
      // todo validate
      outgoing.statusCode = 201;
    }

    if (request.resource instanceof Collection &&
        request.crud === 'read' && request.many && request.args.count >= 0
    ) {
      outgoing.setHeader(HttpHeaderCodes.X_Total_Count, String(response.count));
    }

    outgoing.statusCode = outgoing.statusCode || HttpStatusCodes.OK;
    outgoing.setHeader(HttpHeaderCodes.Cache_Control, 'no-cache');
    outgoing.setHeader(HttpHeaderCodes.Pragma, 'no-cache');
    outgoing.setHeader(HttpHeaderCodes.Expires, '-1');
    outgoing.setHeader(HttpHeaderCodes.X_Opra_Version, OpraSchema.SpecVersion);
    // Expose headers if cors enabled
    if (outgoing.getHeader(HttpHeaderCodes.Access_Control_Allow_Origin)) {
      // Expose X-Total-Count header
      outgoing.appendHeader(HttpHeaderCodes.Access_Control_Expose_Headers, [HttpHeaderCodes.X_Total_Count]);
      // Expose X-Opra-* headers
      outgoing.appendHeader(HttpHeaderCodes.Access_Control_Expose_Headers,
          Object.values(HttpHeaderCodes)
              .filter(k => k.toLowerCase().startsWith('x-opra-'))
      );
    }

    if (response.value) {
      if (typeof response.value === 'object') {
        if (isReadable(response.value) || Buffer.isBuffer(response.value))
          outgoing.send(response.value);
        else {
          const body = this.i18n.deep(response.value);
          outgoing.setHeader(HttpHeaderCodes.Content_Type, 'application/json; charset=utf-8');
          outgoing.send(JSON.stringify(body));
        }
      } else outgoing.send(JSON.stringify(response.value));
    }
    outgoing.end();
  }

  protected async handleError(incoming: HttpServerRequest, outgoing: HttpServerResponse, errors: any[]): Promise<void> {
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
    if (!status || status < Number(HttpStatusCodes.BAD_REQUEST)) {
      status = errors[0].status;
      if (status < Number(HttpStatusCodes.BAD_REQUEST))
        status = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    }
    const body = this.i18n.deep({
      errors: errors.map(e => e.issue)
    });
    outgoing.statusCode = status;
    outgoing.setHeader(HttpHeaderCodes.Content_Type, 'application/json; charset=utf-8');
    outgoing.setHeader(HttpHeaderCodes.Cache_Control, 'no-cache');
    outgoing.setHeader(HttpHeaderCodes.Pragma, 'no-cache');
    outgoing.setHeader(HttpHeaderCodes.Expires, '-1');
    outgoing.setHeader(HttpHeaderCodes.X_Opra_Version, OpraSchema.SpecVersion);
    outgoing.send(JSON.stringify(body));
    outgoing.end();
  }

  protected log(logType: keyof ILogger, incoming: HttpServerRequest, message: string, ...optionalParams: any[]) {
    const logFn = logType === 'fatal'
        ? this.logger?.fatal || this.logger?.error
        : this.logger?.[logType];
    if (!logFn)
      return;
    logFn.apply(this.logger, [String(message), ...optionalParams]);
  }

}

export class OpraHttpAdapter extends OpraHttpAdapterBase {
  readonly server: http.Server;

  static create(
      api: ApiDocument,
      options?: OpraHttpAdapter.Options
  ) {
    const adapter = new OpraHttpAdapter(api);
    const basePath = new OpraURLPath(options?.basePath);

    http.createServer((incomingMessage: http.IncomingMessage, serverResponse: http.ServerResponse) => {
      const originalUrl = incomingMessage.url;
      const parsedUrl = new OpraURL(originalUrl);
      const relativePath = OpraURLPath.relative(parsedUrl.path, basePath);
      if (!relativePath) {
        serverResponse.statusCode = HttpStatusCodes.NOT_FOUND;
        serverResponse.statusMessage = HttpStatusMessages[HttpStatusCodes.NOT_FOUND];
        serverResponse.end();
        return;
      }
      parsedUrl.path = relativePath;
      (incomingMessage as any).originalUrl = originalUrl;
      (incomingMessage as any).baseUrl = basePath.toString();
      (incomingMessage as any).parsedUrl = parsedUrl;
      const req = HttpServerRequest.create(incomingMessage);
      const res = HttpServerResponse.create(serverResponse);
      adapter.handler(req, res)
          .catch((e) => (adapter.logger?.fatal || adapter.logger?.error)?.(e));
    })
  }
}
