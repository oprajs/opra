import typeIs from '@browsery/type-is';
import {
  HttpController,
  HttpMediaType,
  HttpOperation,
  InternalServerError,
  NotAcceptableError,
  OpraHttpError,
  OpraSchema,
} from '@opra/common';
import { ExecutionContext, kAssetCache } from '@opra/core';
import { type Validator, vg } from 'valgen';
import type { HttpAdapter } from './http-adapter';
import { MultipartReader } from './impl/multipart-reader.js';
import type { HttpIncoming } from './interfaces/http-incoming.interface.js';
import type { HttpOutgoing } from './interfaces/http-outgoing.interface.js';

export namespace HttpContext {
  export interface Initiator
    extends Omit<
      ExecutionContext.Initiator,
      'document' | 'protocol' | 'documentNode'
    > {
    adapter: HttpAdapter;
    request: HttpIncoming;
    response: HttpOutgoing;
    controller?: HttpController;
    controllerInstance?: any;
    operation?: HttpOperation;
    operationHandler?: Function;
    cookies?: Record<string, any>;
    headers?: Record<string, any>;
    pathParams?: Record<string, any>;
    queryParams?: Record<string, any>;
    mediaType?: HttpMediaType;
    body?: any;
  }
}

export class HttpContext extends ExecutionContext {
  protected _body?: any;
  protected _multipartReader?: MultipartReader;
  readonly protocol: OpraSchema.Transport;
  readonly adapter: HttpAdapter;
  readonly controller?: HttpController;
  readonly controllerInstance?: any;
  readonly operation?: HttpOperation;
  readonly operationHandler?: Function;
  readonly request: HttpIncoming;
  readonly response: HttpOutgoing;
  readonly mediaType?: HttpMediaType;
  readonly cookies: Record<string, any>;
  readonly headers: Record<string, any>;
  readonly pathParams: Record<string, any>;
  readonly queryParams: Record<string, any>;
  declare errors: OpraHttpError[];

  constructor(init: HttpContext.Initiator) {
    super({
      ...init,
      document: init.adapter.document,
      documentNode: init.controller?.node,
      protocol: 'http',
    });
    this.adapter = init.adapter;
    this.protocol = 'http';
    if (init.controller) this.controller = init.controller;
    if (init.controllerInstance)
      this.controllerInstance = init.controllerInstance;
    if (init.operation) this.operation = init.operation;
    if (init.operationHandler) this.operationHandler = init.operationHandler;
    this.request = init.request;
    this.response = init.response;
    this.mediaType = init.mediaType;
    this.cookies = init.cookies || {};
    this.headers = init.headers || {};
    this.pathParams = init.pathParams || {};
    this.queryParams = init.queryParams || {};
    this._body = init.body;
    this.on('finish', () => {
      if (this._multipartReader)
        this._multipartReader.purge().catch(() => undefined);
    });
  }

  get isMultipart(): boolean {
    return !!this.request.is('multipart');
  }

  async getMultipartReader(): Promise<MultipartReader> {
    if (!this.isMultipart)
      throw new InternalServerError(
        'Request content is not a multipart content',
      );
    if (this._multipartReader) return this._multipartReader;
    const { mediaType } = this;
    if (mediaType?.contentType) {
      const arr = Array.isArray(mediaType.contentType)
        ? mediaType.contentType
        : [mediaType.contentType];
      const contentType = arr.find(ct => typeIs.is(ct, ['multipart']));
      if (!contentType)
        throw new NotAcceptableError(
          'This endpoint does not accept multipart requests',
        );
    }
    const reader = new MultipartReader(
      this,
      {
        limits: {
          fields: mediaType?.maxFields,
          fieldSize: mediaType?.maxFieldsSize,
          files: mediaType?.maxFiles,
          fileSize: mediaType?.maxFileSize,
        },
      },
      mediaType,
    );
    this._multipartReader = reader;
    return reader;
  }

  async getBody<T>(): Promise<T> {
    if (this._body !== undefined) return this._body;
    const { request, operation, mediaType } = this;

    if (this.isMultipart) {
      const reader = await this.getMultipartReader();
      /** Retrieve all fields */
      const parts = await reader.getAll();
      /** Filter fields according to configuration */
      this._body = [...parts];
      return this._body;
    }

    this._body = await this.request.readBody({
      limit: operation?.requestBody?.maxContentSize,
    });
    if (this._body != null) {
      // Convert Buffer to string if media is text
      if (
        Buffer.isBuffer(this._body) &&
        request.is(['json', 'xml', 'txt', 'text'])
      ) {
        this._body = this._body.toString('utf-8');
      }

      // Transform text to Object if media is JSON
      if (typeof this._body === 'string' && request.is(['json']))
        this._body = JSON.parse(this._body);
    }

    if (mediaType) {
      // Decode/Validate the data object according to data model
      if (this._body && mediaType.type) {
        let decode = this.adapter[kAssetCache].get<Validator>(
          mediaType,
          'decode',
        )!;
        if (!decode) {
          decode =
            mediaType.type?.generateCodec('decode', {
              scope: this.adapter.scope,
              partial: operation?.requestBody?.partial,
              projection: '*',
              ignoreReadonlyFields: true,
              allowPatchOperators: operation?.requestBody?.allowPatchOperators,
              keepKeyFields: operation?.requestBody?.keepKeyFields,
            }) || vg.isAny();
          this.adapter[kAssetCache].set(mediaType, 'decode', decode);
        }
        this._body = decode(this._body);
      }
    }
    return this._body;
  }
}
