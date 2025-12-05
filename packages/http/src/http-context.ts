import typeIs from '@browsery/type-is';
import {
  HttpController,
  HttpMediaType,
  HttpOperation,
  InternalServerError,
  NotAcceptableError,
} from '@opra/common';
import { ExecutionContext, kAssetCache } from '@opra/core';
import { type Validator } from 'valgen';
import type { HttpAdapter } from './http-adapter';
import { MultipartReader } from './impl/multipart-reader.js';
import type { HttpIncoming } from './interfaces/http-incoming.interface.js';
import type { HttpOutgoing } from './interfaces/http-outgoing.interface.js';

export class HttpContext extends ExecutionContext {
  protected _body?: any;
  protected _multipartReader?: MultipartReader;
  declare readonly __contDef: HttpController;
  declare readonly __oprDef: HttpOperation;
  declare readonly __controller: any;
  declare readonly __handler?: Function;
  declare readonly __adapter: HttpAdapter;
  readonly request: HttpIncoming;
  readonly response: HttpOutgoing;
  readonly mediaType?: HttpMediaType;
  readonly cookies: Record<string, any>;
  readonly headers: Record<string, any>;
  readonly pathParams: Record<string, any>;
  readonly queryParams: Record<string, any>;
  errors: Error[] = [];

  constructor(init: HttpContext.Initiator) {
    super({
      ...init,
      __docNode:
        init.__oprDef?.node ||
        init.__contDef?.node ||
        init.__adapter.document.node,
      transport: 'http',
    });
    if (init.__contDef) this.__contDef = init.__contDef;
    if (init.__controller) this.__controller = init.__controller;
    if (init.__oprDef) this.__oprDef = init.__oprDef;
    if (init.__handler) this.__handler = init.__handler;
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
    const { request, __oprDef, mediaType } = this;

    if (this.isMultipart) {
      const reader = await this.getMultipartReader();
      /** Retrieve all fields */
      const parts = await reader.getAll();
      /** Filter fields according to configuration */
      this._body = [...parts];
      return this._body;
    }

    this._body = await this.request.readBody({
      limit: __oprDef?.requestBody?.maxContentSize,
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
        let decode = this.__adapter[kAssetCache].get<Validator>(
          mediaType,
          'decode',
        )!;
        if (!decode) {
          decode = mediaType.generateCodec('decode', {
            scope: this.__adapter.scope,
            partial: __oprDef?.requestBody?.partial,
            projection: '*',
            ignoreReadonlyFields: true,
            allowPatchOperators: __oprDef?.requestBody?.allowPatchOperators,
            keepKeyFields: __oprDef?.requestBody?.keepKeyFields,
          });
          this.__adapter[kAssetCache].set(mediaType, 'decode', decode);
        }
        this._body = decode(this._body);
      }
    }
    return this._body;
  }
}

export namespace HttpContext {
  export interface Initiator extends Omit<
    ExecutionContext.Initiator,
    '__adapter' | 'transport'
  > {
    __adapter: HttpAdapter;
    __contDef?: HttpController;
    __oprDef?: HttpOperation;
    __controller?: any;
    __handler?: Function;
    request: HttpIncoming;
    response: HttpOutgoing;
    cookies?: Record<string, any>;
    headers?: Record<string, any>;
    pathParams?: Record<string, any>;
    queryParams?: Record<string, any>;
    mediaType?: HttpMediaType;
    body?: any;
  }
}
