import { OutgoingHttpHeaders } from 'http';
import { Writable } from 'stream';
import { normalizeHeaders } from '@opra/common';
import { IHttpResponseWrapper } from '../../../src/index.js';

export function createResponseWrapper(res: {
  status?: number;
  headers?: Record<string, string>;
  body?: any;
}): IHttpResponseWrapper {
  const headers: OutgoingHttpHeaders = normalizeHeaders(res.headers) || {};
  const wrapper: IHttpResponseWrapper = {
    getInstance(): any {
      return res;
    },
    getHeader(name: string): number | string | string[] | undefined {
      return headers[name.toLowerCase()];
    },
    getHeaders(): OutgoingHttpHeaders {
      return headers;
    },
    getHeaderNames(): string[] {
      return Object.keys(headers);
    },
    hasHeader(name: string): boolean {
      return headers.hasOwnProperty(name.toLowerCase());
    },
    removeHeader(name: string): void {
      delete headers[name.toLowerCase()]
    },
    setHeader(name: string, value: number | string | string[]) {
      headers[name.toLowerCase()] = value;
      return wrapper;
    },
    getStatus(): number | undefined {
      return res.status;
    },
    setStatus(value: number) {
      res.status = value;
      return wrapper;
    },
    getStream(): Writable {
      return new Writable();
    },
    send() {
      //
      return wrapper;
    },
    end() {
      return wrapper;
    }
  }
  return wrapper;
}
