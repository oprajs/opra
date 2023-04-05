import { Response } from 'express';
import { OutgoingHttpHeaders } from 'http';
import { Writable } from 'stream';
import { HttpResponseWrapper } from '../interfaces/execution-context.interface.js';

export class ExpressResponseWrapperHost implements HttpResponseWrapper {
  constructor(readonly instance: Response) {
  }

  getInstance(): any {
    return this.instance;
  }

  getHeader(name: string): number | string | string[] | undefined {
    return this.instance.get(name);
  }

  getHeaders(): OutgoingHttpHeaders {
    return this.instance.getHeaders();
  }

  getHeaderNames(): string[] {
    return this.instance.getHeaderNames();
  }

  hasHeader(name: string): boolean {
    return this.instance.hasHeader(name);
  }

  removeHeader(name: string): void {
    return this.instance.removeHeader(name);
  }

  setHeader(name: string, value: number | string | string[]): this {
    this.instance.setHeader(name, value);
    return this;
  }

  getStatus(): number | undefined {
    return this.instance.statusCode;
  }

  setStatus(value: number): this {
    // noinspection SuspiciousTypeOfGuard
    this.instance.status(typeof value === 'number'
        ? value
        : parseInt(value, 10) || 500);
    return this;
  }

  getStream(): Writable {
    return this.instance;
  }

  send(body: any): this {
    if (typeof body === 'string' || Buffer.isBuffer(body))
      this.instance.send(body);
    else this.instance.json(body);
    return this;
  }

  end(): this {
    this.instance.end();
    return this;
  }

}
