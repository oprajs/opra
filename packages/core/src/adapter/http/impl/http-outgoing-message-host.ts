/*
  This file contains code blocks from open source NodeJs project
  https://github.com/nodejs/
 */

import http, { OutgoingHttpHeaders } from 'http';
import * as stream from 'stream';
import { validateHeaderName, validateHeaderValue, validateString } from '../helpers/common.js';
import type { HttpIncomingMessage } from './http-incoming-message-host.js';

export const kOutHeaders = Symbol('kOutHeaders');
export const kOutTrailers = Symbol('kOutTrailers');
export const kErrored = Symbol('kErrored');

// Fix missing typings in lib.dom.d.ts
declare global {
  interface Headers {
    keys(): IterableIterator<string>;

    entries(): IterableIterator<[string, any]>;
  }
}

export interface HttpOutgoingMessage extends Pick<http.ServerResponse,
    'addTrailers' |
    'getHeader' |
    'getHeaders' |
    'getHeaderNames' |
    'removeHeader' |
    'hasHeader' |
    'headersSent' |
    'statusCode' |
    'statusMessage' |
    'sendDate'
>, stream.Writable {
  req?: HttpIncomingMessage;

  appendHeader(name: string, value: string | readonly string[]): this;

  setHeader(name: string, value: number | string | readonly string []): this;
}

export namespace HttpOutgoingMessageHost {
  export interface Initiator {
    req?: HttpIncomingMessage;
    statusCode?: number;
    statusMessage?: string;
    headers?: OutgoingHttpHeaders | Headers | Map<string, any> | string[];
    chunkedEncoding?: boolean;
    sendDate?: boolean;
    strictContentLength?: boolean;
    body?: any;
  }

}

export interface HttpOutgoingMessageHost extends stream.Writable {

}

// noinspection JSUnusedLocalSymbols
/**
 *
 * @class HttpOutgoingMessageHost
 */
export class HttpOutgoingMessageHost {
  protected _headersSent: boolean = false;
  protected _closed: boolean = false;
  protected [kErrored]: Error | null = null;
  protected [kOutHeaders]: Record<string, any>;
  protected [kOutTrailers]: Record<string, any>;
  finished: boolean = false;
  req?: HttpIncomingMessage;
  statusCode: number;
  statusMessage: string;
  chunkedEncoding: boolean;
  sendDate: boolean;
  strictContentLength: boolean;
  body?: any;

  constructor() {
    stream.Stream.apply(this);
  }

  get headersSent(): boolean {
    return this._headersSent;
  }

  get closed(): boolean {
    return this._closed;
  }

  get errored(): Error | null {
    return this[kErrored];
  }

  appendHeader(name: string, value: number | string | readonly string[]) {
    if (this.headersSent)
      throw new Error(`Cannot set headers after they are sent to the client`)
    validateHeaderName(name);
    validateHeaderValue(name, value);
    const field = name.toLowerCase();
    const headers = this[kOutHeaders];
    if (headers == null || !headers[field]) {
      return this.setHeader(name, value);
    }

    // Prepare the field for appending, if required
    if (!Array.isArray(headers[field][1])) {
      headers[field][1] = [headers[field][1]];
    }

    const existingValues = headers[field][1];
    if (Array.isArray(value)) {
      for (let i = 0, length = value.length; i < length; i++) {
        existingValues.push(value[i]);
      }
    } else {
      existingValues.push(value);
    }
    return this;
  }

  addTrailers(headers: OutgoingHttpHeaders | [string, string][] | readonly [string, string][]): void {
    if (headers && typeof headers === 'object') {
      const entries = typeof headers.entries === 'function'
          ? headers.entries() : Object.entries(headers);
      let trailers = this[kOutTrailers];
      if (trailers == null)
        this[kOutTrailers] = trailers = {__proto__: null};
      for (const [name, value] of entries) {
        validateHeaderName(name);
        validateHeaderValue(name, value);
        trailers[String(name).toLowerCase()] = [String(name), value];
      }
      return;
    }
    throw new TypeError('Invalid "headers" argument. Value must be an object or raw headers array');
  }

  setHeader(name, value) {
    if (this.headersSent)
      throw new Error(`Cannot set headers after they are sent to the client`)
    validateHeaderName(name);
    validateHeaderValue(name, value);

    let headers = this[kOutHeaders];
    if (headers == null)
      this[kOutHeaders] = headers = {__proto__: null};

    headers[name.toLowerCase()] = [name, value];
    return this;
  }

  setHeaders(headers: Headers | Map<string, any> | Record<string, any>) {
    if (this.headersSent)
      throw new Error(`Cannot set headers after they are sent to the client`)
    if (headers && typeof headers === 'object' && !Array.isArray(headers)) {
      const entries = typeof headers.entries === 'function'
          ? headers.entries() : Object.entries(headers);
      for (const entry of entries) {
        this.setHeader(entry[0], entry[1]);
      }
      return this;
    }
    throw new TypeError('Invalid "headers" argument. Value must be an instance of "Headers" or "Map"');
  }

  getHeader(name: string): any {
    validateString(name);
    const headers = this[kOutHeaders];
    if (headers == null)
      return;
    const entry = headers[name.toLowerCase()];
    return entry && entry[1];
  }

  getHeaderNames() {
    return this[kOutHeaders] != null ? Object.keys(this[kOutHeaders]) : [];
  }

  getRawHeaderNames() {
    const headersMap = this[kOutHeaders];
    if (!headersMap)
      return [];
    const values: [string, any][] = Object.values(headersMap);
    const headers = Array(values.length);
    for (let i = 0, l = values.length; i < l; i++) {
      headers[i] = values[i][0];
    }
    return headers;
  }

  getHeaders(): OutgoingHttpHeaders {
    const headers = this[kOutHeaders];
    // @ts-ignore
    const ret: OutgoingHttpHeaders = {__proto__: null};
    if (headers) {
      const keys = Object.keys(headers);
      let key;
      let val;
      for (let i = 0; i < keys.length; ++i) {
        key = keys[i];
        val = headers[key][1];
        ret[key] = val;
      }
    }
    return ret;
  }

  hasHeader(name: string) {
    validateString(name);
    return this[kOutHeaders] != null &&
        !!this[kOutHeaders][name.toLowerCase()];
  }

  removeHeader(name: string) {
    validateString(name);
    if (this.headersSent)
      throw new Error(`Cannot remove headers after they are sent to the client`)
    const key = name.toLowerCase();
    // switch (key) {
    //   case 'connection':
    //     this._removedConnection = true;
    //     break;
    //   case 'content-length':
    //     this._removedContLen = true;
    //     break;
    //   case 'transfer-encoding':
    //     this._removedTE = true;
    //     break;
    //   case 'date':
    //     this.sendDate = false;
    //     break;
    // }
    if (this[kOutHeaders] != null) {
      delete this[kOutHeaders][key];
    }
  }

  end(cb?: () => void): this;
  end(chunk: any, cb?: () => void): this;
  end(chunk: any, encoding: BufferEncoding, cb?: () => void): this
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  end(arg0?, arg1?, arg2?): this {
    // let cb: (() => void) | undefined;
    // let chunk: any;
    // let encoding: BufferEncoding | undefined;
    //
    // if (typeof arg0 === 'function')
    //   cb = arg0;
    // else {
    //   chunk = arg0;
    //   if (typeof arg1 === 'function')
    //     cb = arg1;
    //   else {
    //     encoding = arg1;
    //     cb = arg2;
    //   }
    // }
    //
    return this;
  }

  protected _readConfig(init: HttpOutgoingMessageHost.Initiator) {
    this.req = init.req;
    this.statusCode = init?.statusCode || 0;
    this.statusMessage = init?.statusMessage || '';
    this.chunkedEncoding = !!init?.chunkedEncoding;
    this.sendDate = !!init?.sendDate;
    this.strictContentLength = !!init?.strictContentLength;
    if (init.headers) {
      this.setHeaders(Array.isArray(init.headers) ? new Map([init.headers] as any) : init.headers);
    }
    this.body = init.body;
  }

  static create(init?: HttpOutgoingMessageHost.Initiator) {
    const msg = new HttpOutgoingMessageHost();
    if (init)
      msg._readConfig(init);
    return msg;
  }

}

// Apply mixins
Object.assign(HttpOutgoingMessageHost.prototype, stream.Stream.prototype);
