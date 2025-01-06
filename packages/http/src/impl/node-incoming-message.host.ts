/*
  This file contains code blocks from open source NodeJs project
  https://github.com/nodejs/
 */
import { type HTTPParserJS } from '@browsery/http-parser';
import { isAsyncIterable, isIterable } from '@jsopen/objects';
import type { IncomingHttpHeaders } from 'http';
import { Duplex, Readable } from 'stream';
import type { NodeIncomingMessage } from '../interfaces/node-incoming-message.interface.js';
import {
  convertToHeaders,
  convertToHeadersDistinct,
} from '../utils/convert-to-headers.js';
import { convertToRawHeaders } from '../utils/convert-to-raw-headers.js';

export const CRLF = Buffer.from('\r\n');
export const kHeaders = Symbol.for('kHeaders');
export const kHeadersDistinct = Symbol.for('kHeadersDistinct');
export const kTrailers = Symbol.for('kTrailers');
export const kTrailersDistinct = Symbol.for('kTrailersDistinct');
export const kHttpParser = Symbol.for('kHttpParser');

/**
 *
 * @class NodeIncomingMessageHost
 */
export class NodeIncomingMessageHost
  extends Duplex
  implements NodeIncomingMessage
{
  protected [kHeaders]?: IncomingHttpHeaders;
  protected [kHeadersDistinct]?: NodeJS.Dict<string[]>;
  protected [kTrailers]?: NodeJS.Dict<string>;
  protected [kTrailersDistinct]?: NodeJS.Dict<string[]>;
  protected [kHttpParser]: HTTPParserJS | undefined;
  protected _readStream?: Readable;
  declare httpVersionMajor: number;
  declare httpVersionMinor: number;
  declare method: string;
  declare url: string;
  rawHeaders: string[] = [];
  rawTrailers: string[] = [];
  params?: Record<string, any>;
  cookies?: Record<string, any>;
  body?: Buffer;
  complete: boolean = false;
  ip?: string;
  ips?: string[];
  joinDuplicateHeaders = false;

  constructor(init?: NodeIncomingMessage.Initiator) {
    super();
    if (init) {
      this.complete = true;
      this.httpVersionMajor = init.httpVersionMajor || 1;
      this.httpVersionMinor = init.httpVersionMinor || 0;
      this.method = (init.method || 'GET').toUpperCase();
      this.url = init.url || '';
      if (init.body != null) {
        if (Buffer.isBuffer(init.body)) this.body = init.body;
        else if (typeof init.body === 'string')
          this.body = Buffer.from(init.body, 'utf-8');
        else this.body = Buffer.from(JSON.stringify(init.body), 'utf-8');
      }
      if (init.headers) {
        this.rawHeaders = Array.isArray(init.headers)
          ? init.headers
          : convertToRawHeaders(init.headers);
      }
      if (init.trailers) {
        this.rawTrailers = Array.isArray(init.trailers)
          ? init.trailers
          : convertToRawHeaders(init.trailers);
      }
      this.ip = init.ip || '';
      this.ips = init.ips || (this.ip ? [this.ip] : []);
      if (this.body && !this.headers['content-length'])
        this.headers['content-length'] = String(this.body.length);
      if (init.params) this.params = init.params;
      if (init.cookies) this.cookies = init.cookies;
    }
  }

  get httpVersion(): string {
    return this.httpVersionMajor
      ? this.httpVersionMajor + '.' + this.httpVersionMinor
      : '';
  }

  get headers(): IncomingHttpHeaders {
    if (!this[kHeaders])
      this[kHeaders] = convertToHeaders(
        this.rawHeaders,
        {},
        this.joinDuplicateHeaders,
      );
    return this[kHeaders];
  }

  set headers(headers: IncomingHttpHeaders) {
    this[kHeaders] = headers;
  }

  get headersDistinct(): NodeJS.Dict<string[]> {
    if (!this[kHeadersDistinct])
      this[kHeadersDistinct] = convertToHeadersDistinct(this.rawHeaders, {});
    return this[kHeadersDistinct];
  }

  get trailers(): NodeJS.Dict<string> {
    if (!this[kTrailers])
      this[kTrailers] = convertToHeaders(
        this.rawTrailers,
        {},
        this.joinDuplicateHeaders,
      );
    return this[kTrailers];
  }

  set trailers(trailers: NodeJS.Dict<string>) {
    this[kTrailers] = trailers;
  }

  get trailersDistinct(): NodeJS.Dict<string[]> {
    if (!this[kTrailersDistinct])
      this[kTrailersDistinct] = convertToHeadersDistinct(this.rawTrailers, {});
    return this[kTrailersDistinct];
  }

  _read(size: number) {
    if (!this.body) {
      this.push(null);
      return;
    }
    if (!this._readStream) {
      if (isIterable(this.body) || isAsyncIterable(this.body))
        this._readStream = Readable.from(this.body);
      else if (typeof this.body === 'string') {
        this._readStream = Readable.from(Buffer.from(this.body, 'utf-8'));
      } else
        this._readStream = Readable.from(
          Buffer.from(JSON.stringify(this.body), 'utf-8'),
        );
    }
    const chunk = this._readStream.read(size);
    this.push(chunk);
  }

  _write(
    chunk: any,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ): void {
    const error = this[kHttpParser]?.execute(chunk);
    if (error && typeof error === 'object') callback(error);
    else callback();
  }
}
