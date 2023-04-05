import type { Request } from 'express';
import type { IncomingHttpHeaders } from 'http';
import { Readable } from 'stream';
import type { HttpRequestWrapper } from '../interfaces/execution-context.interface';

export class ExpressRequestWrapperHost implements HttpRequestWrapper {
  constructor(readonly instance: Request) {
  }

  getInstance(): any {
    return this.instance;
  }

  getMethod(): string {
    return this.instance.method;
  }

  getUrl(): string {
    return this.instance.url;
  }

  getHeaderNames(): string[] {
    return Object.keys(this.instance.headers);
  }

  getHeader(name: string): string | string[] | undefined {
    return this.instance.get(name);
  }

  getHeaders(): IncomingHttpHeaders {
    return this.instance.headers;
  }

  getBody(): any {
    return this.instance.body;
  }

  isCompleted(): boolean {
    return this.instance.complete;
  }

  getStream(): Readable {
    return this.instance;
  }

}
