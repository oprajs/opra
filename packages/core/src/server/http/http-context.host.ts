import { Validator, vg } from 'valgen';
import typeIs from '@browsery/type-is';
import {
  BadRequestError,
  HttpController,
  HttpMediaType,
  HttpOperation,
  InternalServerError,
  NotAcceptableError,
} from '@opra/common';
import { ExecutionContextHost } from '../base/execution-context.host.js';
import type { HttpAdapterHost } from './http-adapter-host.js';
import { HttpContext } from './interfaces/http-context.interface.js';
import type { HttpIncoming } from './interfaces/http-incoming.interface';
import type { HttpOutgoing } from './interfaces/http-outgoing.interface';
import { MultipartReader } from './multipart-reader.js';

export namespace HttpContextHost {
  export interface Initiator extends ExecutionContextHost.Initiator {
    adapter: HttpAdapterHost;
    operation?: HttpOperation;
    request: HttpIncoming;
    response: HttpOutgoing;
    resource?: HttpController;
    cookies?: Record<string, any>;
    headers?: Record<string, any>;
    pathParams?: Record<string, any>;
    queryParams?: Record<string, any>;
    mediaType?: HttpMediaType;
    body?: any;
  }
}

export class HttpContextHost extends ExecutionContextHost implements HttpContext {
  protected _body?: any;
  protected _multipartReader?: MultipartReader;
  adapter: HttpAdapterHost;
  resource: HttpController;
  operation: HttpOperation;
  request: HttpIncoming;
  response: HttpOutgoing;
  mediaType?: HttpMediaType;
  cookies: Record<string, any>;
  headers: Record<string, any>;
  pathParams: Record<string, any>;
  queryParams: Record<string, any>;

  constructor(init: HttpContextHost.Initiator) {
    super(init);
    this.adapter = init.adapter;
    this.protocol = 'http';
    if (init.resource) this.resource = init.resource;
    if (init.operation) this.operation = init.operation;
    this.request = init.request;
    this.response = init.response;
    this.mediaType = init.mediaType;
    this.cookies = init.cookies || {};
    this.headers = init.headers || {};
    this.pathParams = init.pathParams || {};
    this.queryParams = init.queryParams || {};
    this._body = init.body;
  }

  get isMultipart(): boolean {
    return !!this.request.is('multipart');
  }

  async getMultipartReader(): Promise<MultipartReader> {
    if (!this.isMultipart) throw new InternalServerError('Request content is not a multipart content');
    if (this._multipartReader) return this._multipartReader;
    const { request, mediaType } = this;
    if (mediaType?.contentType) {
      const arr = Array.isArray(mediaType.contentType) ? mediaType.contentType : [mediaType.contentType];
      const contentType = arr.find(ct => typeIs.is(ct, ['multipart']));
      if (!contentType) throw new NotAcceptableError('This endpoint does not accept multipart requests');
    }
    const reader = new MultipartReader(request, {
      maxFields: mediaType?.maxFields,
      maxFieldsSize: mediaType?.maxFieldsSize,
      maxFiles: mediaType?.maxFiles,
      maxFileSize: mediaType?.maxFileSize,
      maxTotalFileSize: mediaType?.maxTotalFileSize,
      minFileSize: mediaType?.minFileSize,
    });
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
      this._body = [];
      const multipartFields = mediaType?.multipartFields;
      if (mediaType && multipartFields?.length) {
        const fieldsFound = new Map();
        for (const item of parts) {
          const field = mediaType.findMultipartField(item.fieldName, item.type);
          if (field) {
            fieldsFound.set(field, true);
            this._body.push(item);
          }
        }
        /** Check required fields */
        for (const field of multipartFields) {
          if (field.required && !fieldsFound.get(field))
            throw new BadRequestError({
              message: `Multipart field (${field.fieldName}) is required`,
            });
        }
      }
      return this._body;
    }

    this._body = await this.request.readBody({ limit: operation.requestBody?.maxContentSize });
    if (this._body != null) {
      // Convert Buffer to string if media is text
      if (Buffer.isBuffer(this._body) && request.is(['json', 'xml', 'txt', 'text']))
        this._body = this._body.toString('utf-8');

      // Transform text to Object if media is JSON
      if (typeof this._body === 'string' && request.is(['json'])) this._body = JSON.parse(this._body);
    }

    if (mediaType) {
      // Decode/Validate the data object according to data model
      if (this._body && mediaType.type) {
        let decode = this.adapter.getCachedAsset<Validator>(mediaType, 'decode')!;
        if (!decode) {
          decode = mediaType.type?.generateCodec('decode') || vg.isAny();
          this.adapter.setCachedAsset(mediaType, 'decode', decode);
        }
        this._body = decode(this._body);
      }
    }
    return this._body;
  }
}
