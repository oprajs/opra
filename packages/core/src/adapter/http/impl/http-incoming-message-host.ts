/*
  This file contains code blocks from open source NodeJs project
  https://github.com/nodejs/
 */

import http, { IncomingHttpHeaders } from 'http';
import * as stream from 'stream';
import { Readable } from 'stream';
import { HeaderInfo, HTTPParser } from '@browsery/http-parser';
import { isReadable } from '@opra/common';
import { convertToHeaders, convertToHeadersDistinct } from '../helpers/convert-to-headers.js';
import { convertToRawHeaders } from '../helpers/convert-to-raw-headers.js';

export const CRLF = Buffer.from('\r\n');
export const kHeaders = Symbol('kHeaders');
export const kHeadersDistinct = Symbol('kHeadersDistinct');
export const kTrailers = Symbol('kTrailers');
export const kTrailersDistinct = Symbol('kTrailersDistinct');

export interface HttpIncomingMessage extends Pick<http.IncomingMessage,
    'httpVersion' |
    'httpVersionMajor' |
    'httpVersionMinor' |
    'complete' |
    'headers' |
    'trailers' |
    'rawHeaders' |
    'rawTrailers' |
    'method' |
    'url'
>, stream.Readable {
}

// noinspection JSUnusedLocalSymbols
export namespace HttpIncomingMessageHost {
  export interface Initiator {
    httpVersionMajor?: number;
    httpVersionMinor?: number;
    method?: string;
    url?: string;
    headers?: Record<string, any> | string[];
    trailers?: Record<string, any> | string[];
    body?: any;
    ip?: string;
    ips?: string[];
  }

}

export interface HttpIncomingMessageHost extends stream.Readable {

}

/**
 *
 * @class HttpIncomingMessageHost
 */
export class HttpIncomingMessageHost implements HttpIncomingMessage {
  httpVersionMajor: number;
  httpVersionMinor: number;
  method: string;
  url: string;
  rawHeaders: string[] = [];
  rawTrailers: string[] = [];
  body?: any;
  complete: boolean = false;
  ip?: string;
  ips?: string[];
  joinDuplicateHeaders = false;

  constructor() {
    stream.Readable.apply(this);
  }

  get httpVersion(): string {
    return this.httpVersionMajor
        ? this.httpVersionMajor + '.' + this.httpVersionMinor
        : '';
  }

  get headers(): IncomingHttpHeaders {
    if (!this[kHeaders])
      this[kHeaders] = convertToHeaders(this.rawHeaders, {}, this.joinDuplicateHeaders);
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
      this[kTrailers] = convertToHeaders(this.rawTrailers, {}, this.joinDuplicateHeaders);
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

  protected _readConfig(init: HttpIncomingMessageHost.Initiator) {
    this.complete = true;
    this.httpVersionMajor = init?.httpVersionMajor || 1;
    this.httpVersionMinor = init?.httpVersionMinor || 0;
    this.method = (init.method || 'GET').toUpperCase();
    this.url = init.url || '';
    this.body = init.body;
    if (init.headers)
      this.rawHeaders = Array.isArray(init.headers) ? init.headers : convertToRawHeaders(init.headers);
    if (init.trailers)
      this.rawTrailers = Array.isArray(init.trailers) ? init.trailers : convertToRawHeaders(init.trailers);
    this.ip = init.ip || '';
    this.ips = init.ips || (this.ip ? [this.ip] : []);
  }

  protected _readBuffer(buf: Buffer | ArrayBuffer) {
    const parser = new HTTPParser(HTTPParser.REQUEST);
    let bodyChunks: Buffer[] | undefined;
    parser[HTTPParser.kOnHeadersComplete] = (info: HeaderInfo) => {
      this.httpVersionMajor = info.versionMajor;
      this.httpVersionMinor = info.versionMinor;
      this.rawHeaders = info.headers;
      this.method = HTTPParser.methods[info.method];
      this.url = info.url;
    };
    parser[HTTPParser.kOnHeaders] = (trailers: string[]) => {
      this.rawTrailers = trailers;
    }
    parser[HTTPParser.kOnBody] = (chunk: Buffer, offset: number, length: number) => {
      bodyChunks = bodyChunks || [];
      bodyChunks.push(chunk.subarray(offset, offset + length));
    };
    parser[HTTPParser.kOnMessageComplete] = () => {
      this.complete = true;
      if (bodyChunks)
        this.body = Buffer.concat(bodyChunks);
    }
    const buffer: Buffer = Buffer.from(buf);
    let x = parser.execute(buffer, 0, buffer.length);
    if (typeof x === 'object') throw x;
    if (!this.complete) {
      x = parser.execute(CRLF);
      if (typeof x === 'object') throw x;
    }
    parser.finish();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _readStream(readable: Readable) {
    throw new Error('_readStream is not implemented yet')
  }

  static create(init?: HttpIncomingMessageHost.Initiator | Buffer | stream.Readable) {
    const msg = new HttpIncomingMessageHost();
    if (Buffer.isBuffer(init))
      msg._readBuffer(init)
    else if (isReadable(init)) {
      throw new Error('fromStream is not implemented yet')
    } else if (init)
      msg._readConfig(init);
    return msg;
  }

}

// Apply mixins
Object.assign(HttpIncomingMessageHost.prototype, stream.Readable.prototype);

