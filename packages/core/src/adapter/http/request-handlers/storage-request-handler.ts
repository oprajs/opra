import fs from 'fs/promises';
import os from 'os';
import {
  BadRequestError,
  HttpStatusCodes,
  isReadable, OpraException,
  OpraSchema,
  Storage,
  uid
} from '@opra/common';
import { EndpointContext } from '../../endpoint-context.js';
import type { ExecutionContext } from '../../execution-context';
import { RequestHost } from '../../request.host.js';
import { Request } from '../../request.js';
import { ResponseHost } from '../../response.host.js';
import { Response } from '../../response.js';
import { MultipartIterator } from '../helpers/multipart-helper.js';
import type { HttpAdapterBase } from '../http-adapter-base.js';
import { HttpServerRequest } from '../http-server-request.js';
import { RequestHandlerBase } from './request-handler-base.js';

export namespace StorageRequestHandler {
  export interface Options {
    uploadDir?: string;
  }
}

/**
 * @class StorageRequestHandler
 */
export class StorageRequestHandler extends RequestHandlerBase {
  _uploadDir: string;

  constructor(readonly adapter: HttpAdapterBase, options?: StorageRequestHandler.Options) {
    super(adapter);
    this._uploadDir = options?.uploadDir || os.tmpdir();
  }

  async processRequest(executionContext: ExecutionContext): Promise<void> {
    const {incoming, outgoing} = executionContext.switchToHttp();
    // Parse incoming message and create Request object
    const request = await this.parseRequest(executionContext, incoming);
    if (!request) return;
    const response: Response = new ResponseHost({http: outgoing});
    const context = EndpointContext.from(executionContext, request, response);
    await this.callEndpoint(context);
    if (response.errors.length) {
      context.errors.push(...response.errors);
      return;
    }
    await this.sendResponse(context);
  }

  async parseRequest(executionContext: ExecutionContext, incoming: HttpServerRequest): Promise<Request | undefined> {
    const contentId = incoming.headers['content-id'] as string;
    const p = incoming.parsedUrl.path[0];
    const resource = this.adapter.api.getResource(p.resource);
    try {
      if (!(resource instanceof Storage))
        return;
      switch (incoming.method) {
        case 'GET': {
          const endpointMeta: any = await this.assertEndpoint<OpraSchema.Storage.PostEndpoint>(resource, 'get');
          return new RequestHost({
            controller: endpointMeta.controller,
            http: incoming,
            resource,
            endpoint: 'get',
            contentId
          });
        }
        case 'DELETE': {
          const endpointMeta: any = await this.assertEndpoint<OpraSchema.Storage.PostEndpoint>(resource, 'delete');
          return new RequestHost({
            controller: endpointMeta.controller,
            http: incoming,
            resource,
            endpoint: 'delete',
            contentId
          });
        }
        case 'POST': {
          const endpointMeta: any = await this.assertEndpoint<OpraSchema.Storage.PostEndpoint>(resource, 'post');
          await fs.mkdir(this._uploadDir, {recursive: true});

          const multipartIterator = new MultipartIterator(incoming, {
            ...endpointMeta,
            filename: () => this.adapter.serviceName + '_p' + process.pid +
                't' + String(Date.now()).substring(8) + 'r' + uid(12)
          });
          multipartIterator.pause();

          // Add an hook to clean up files after request finished
          executionContext.on('finish', async () => {
            multipartIterator.cancel();
            await multipartIterator.deleteFiles().catch(() => void 0);
          });

          return new RequestHost({
            controller: endpointMeta.controller,
            http: incoming,
            resource,
            endpoint: 'post',
            contentId,
            parts: multipartIterator
          });
        }
      }

    } catch (e: any) {
      if (e instanceof OpraException)
        throw e;
      throw new BadRequestError(e);
    }
  }

  async callEndpoint(context: EndpointContext): Promise<void> {
    const request = context.request as RequestHost;
    const {response} = context;
    // Call endpoint handler method
    let value: any;
    try {
      value = await request.controller[request.endpoint].call(request.controller, context);
      if (response.value == null)
        response.value = value;
    } catch (error) {
      response.errors.push(error);
    }
  }

  async sendResponse(context: EndpointContext): Promise<void> {
    const {response} = context;
    const outgoing = response.switchToHttp();
    outgoing.statusCode = outgoing.statusCode || HttpStatusCodes.OK;
    if (response.value != null) {
      if (typeof response.value === 'string') {
        if (!outgoing.hasHeader('content-type'))
          outgoing.setHeader('content-type', 'text/plain');
        outgoing.send(response.value);
      } else if (Buffer.isBuffer(response.value) || isReadable(response.value)) {
        if (!outgoing.hasHeader('content-type'))
          outgoing.setHeader('content-type', 'application/octet-stream');
        outgoing.send(response.value);
      } else {
        outgoing.setHeader('content-type', 'application/json; charset=utf-8');
        outgoing.send(JSON.stringify(response.value));
      }
    }
    outgoing.end();
  }

}
