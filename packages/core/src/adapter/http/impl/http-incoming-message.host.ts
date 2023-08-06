/*
  This file contains code blocks from open source NodeJs project
  https://github.com/nodejs/
 */

import http, { IncomingHttpHeaders } from 'http';
import { Duplex, Readable } from 'stream';
import { HeaderInfo, HTTPParser, HTTPParserJS } from '@browsery/http-parser';
import { isAsyncIterable, isIterable } from '@opra/common';
import { concatReadable } from '../helpers/concat-readable.js';
import { convertToHeaders, convertToHeadersDistinct } from '../helpers/convert-to-headers.js';
import { convertToRawHeaders } from '../helpers/convert-to-raw-headers.js';

export const CRLF = Buffer.from('\r\n');
export const kHeaders = Symbol.for('kHeaders');
export const kHeadersDistinct = Symbol.for('kHeadersDistinct');
export const kTrailers = Symbol.for('kTrailers');
export const kTrailersDistinct = Symbol.for('kTrailersDistinct');

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
>, Readable {
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

/**
 *
 * @class HttpIncomingMessageHost
 */
export class HttpIncomingMessageHost extends Duplex implements HttpIncomingMessage {
  protected [kHeaders]?: IncomingHttpHeaders;
  protected [kHeadersDistinct]?: NodeJS.Dict<string[]>;
  protected [kTrailers]?: NodeJS.Dict<string>;
  protected [kTrailersDistinct]?: NodeJS.Dict<string[]>;
  protected _httpParser: HTTPParserJS | undefined;
  protected _readStream?: Readable;
  httpVersionMajor: number;
  httpVersionMinor: number;
  method: string;
  url: string;
  rawHeaders: string[] = [];
  rawTrailers: string[] = [];
  body?: Buffer;
  complete: boolean = false;
  ip?: string;
  ips?: string[];
  joinDuplicateHeaders = false;

  constructor(init?: HttpIncomingMessageHost.Initiator) {
    super();
    if (init) {
      this.complete = true;
      this.httpVersionMajor = init.httpVersionMajor || 1;
      this.httpVersionMinor = init.httpVersionMinor || 0;
      this.method = (init.method || 'GET').toUpperCase();
      this.url = init.url || '';
      if (init.body != null) {
        if (Buffer.isBuffer(init.body))
          this.body = init.body;
        else if (typeof init.body === 'string')
          this.body = Buffer.from(init.body, 'utf-8');
        else this.body = Buffer.from(JSON.stringify(init.body), 'utf-8');
      }
      if (init.headers)
        this.rawHeaders = Array.isArray(init.headers) ? init.headers : convertToRawHeaders(init.headers);
      if (init.trailers)
        this.rawTrailers = Array.isArray(init.trailers) ? init.trailers : convertToRawHeaders(init.trailers);
      this.ip = init.ip || '';
      this.ips = init.ips || (this.ip ? [this.ip] : []);
      if (this.body && !this.headers['content-length'])
        this.headers['content-length'] = String(this.body.length);
    }
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
        this._readStream = Readable.from(Buffer.from(JSON.stringify(this.body), 'utf-8'));
    }
    const chunk = this._readStream.read(size);
    this.push(chunk);
    // this.push(null);s
  }

  _write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
    const error = this._httpParser?.execute(chunk);
    if (error && typeof error === 'object')
      callback(error);
    else callback();
  }

  static from(iterable: string | Iterable<any> | AsyncIterable<any> | HttpIncomingMessageHost.Initiator) {
    if (typeof iterable === 'object' && !(isIterable(iterable) || isAsyncIterable(iterable)))
      return new HttpIncomingMessageHost(iterable as HttpIncomingMessageHost.Initiator);
    const msg = new HttpIncomingMessageHost();
    const parser = msg._httpParser = new HTTPParser(HTTPParser.REQUEST);
    let bodyChunks: Buffer[] | undefined;
    parser[HTTPParser.kOnHeadersComplete] = (info: HeaderInfo) => {
      msg.httpVersionMajor = info.versionMajor;
      msg.httpVersionMinor = info.versionMinor;
      msg.rawHeaders = info.headers;
      msg.method = HTTPParser.methods[info.method];
      msg.url = info.url;
    };
    parser[HTTPParser.kOnHeaders] = (trailers: string[]) => {
      msg.rawTrailers = trailers;
    }
    parser[HTTPParser.kOnBody] = (chunk: Buffer, offset: number, length: number) => {
      bodyChunks = bodyChunks || [];
      bodyChunks.push(chunk.subarray(offset, offset + length));
    };
    parser[HTTPParser.kOnMessageComplete] = () => {
      msg.complete = true;
      if (bodyChunks)
        msg.body = Buffer.concat(bodyChunks);
    }
    const readable = concatReadable(Readable.from(iterable as any), Readable.from(CRLF));
    msg.once('finish', () => parser.finish());
    readable.pipe(msg);
    return msg;
  }

  static async fromAsync(
      iterable: string | Iterable<any> | AsyncIterable<any> | HttpIncomingMessageHost.Initiator
  ): Promise<HttpIncomingMessageHost> {
    return new Promise<HttpIncomingMessageHost>((resolve, reject) => {
      const msg = this.from(iterable);
      msg.once('finish', () => resolve(msg));
      msg.once('error', (error) => reject(error));
    })

  }

}
