import { IncomingHttpHeaders } from 'http';
import { Readable } from 'stream';
import { normalizeHeaders } from '@opra/common';
import { HttpRequestWrapper } from '../../../src/index.js';

export function createRequestWrapper(req: {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
  bodyStream?: Readable;
}): HttpRequestWrapper {
  const headers = normalizeHeaders(req.headers) || {};
  return {
    getBody(): any {
      return req.body;
    },
    getHeader(name: string): string | string[] | undefined {
      return headers[name.toLowerCase()];
    },
    getHeaders(): IncomingHttpHeaders {
      return headers;
    },
    getHeaderNames(): string[] {
      return Object.keys(headers);
    },
    getMethod(): string {
      return req.method;
    },
    getUrl(): string {
      return req.url;
    },
    getInstance(): any {
      return req;
    },
    isCompleted(): boolean {
      return !!req.bodyStream && !req.bodyStream.closed;
    },
    getStream(): Readable {
      return req.bodyStream || Readable.from([]);
    }
  }
}
