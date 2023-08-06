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
import { HttpServerRequest, OperationContext, Request, Response } from '@opra/core';
import type { ExecutionContext } from '../../execution-context';
import { RequestHost } from '../../request.host.js';
import { ResponseHost } from '../../response.host.js';
import { MultipartIterator } from '../helpers/multipart-helper.js';
import type { HttpAdapterBase } from '../http-adapter-base.js';
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
    const context = OperationContext.from(executionContext, request, response);
    // Execute operation
    await this.executeOperation(context);
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
          const operationMeta: any = await this.assertOperation<OpraSchema.Storage.PostOperation>(resource, 'get');
          return new RequestHost({
            controller: operationMeta.controller,
            http: incoming,
            resource,
            operation: 'get',
            contentId
          });
        }
        case 'DELETE': {
          const operationMeta: any = await this.assertOperation<OpraSchema.Storage.PostOperation>(resource, 'delete');
          return new RequestHost({
            controller: operationMeta.controller,
            http: incoming,
            resource,
            operation: 'delete',
            contentId
          });
        }
        case 'POST': {
          const operationMeta: any = await this.assertOperation<OpraSchema.Storage.PostOperation>(resource, 'post');
          await fs.mkdir(this._uploadDir, {recursive: true});

          const multipartIterator = new MultipartIterator(incoming, {
            ...operationMeta,
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
            controller: operationMeta.controller,
            http: incoming,
            resource,
            operation: 'post',
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

  async executeOperation(context: OperationContext): Promise<void> {
    const request = context.request as RequestHost;
    const {response} = context;
    // Call operation handler method
    let value: any;
    try {
      value = await request.controller[request.operation].call(request.controller, context);
      if (response.value == null)
        response.value = value;
    } catch (error) {
      response.errors.push(error);
    }
  }

  async sendResponse(context: OperationContext): Promise<void> {
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
