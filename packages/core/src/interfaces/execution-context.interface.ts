import { IncomingHttpHeaders, OutgoingHttpHeaders } from 'http';
import { Readable, Writable } from 'stream';

export type ContextType = 'http' | 'ws' | 'rpc';

export namespace IExecutionContext {
  export type OnFinishArgs = {
    userContext: any;
    failed: boolean;
  }
}

export interface IExecutionContext {
  userContext: any;

  getType(): ContextType;

  getPlatform(): string;

  switchToHttp(): IHttpExecutionContext;

  onFinish(fn: (args: IExecutionContext.OnFinishArgs) => void | Promise<void>);
}

export interface IHttpExecutionContext extends IExecutionContext {

  getRequest(): IHttpRequestWrapper;

  getResponse(): IHttpResponseWrapper;
}

export interface IHttpRequestWrapper {

  getInstance(): any;

  getUrl(): string;

  getMethod(): string;

  getHeaderNames(): string[];

  getHeader(name: string): string | string[] | undefined;

  getHeaders(): IncomingHttpHeaders;

  getBody(): any;

  isCompleted(): boolean;

  getStream(): Readable;

}

export interface IHttpResponseWrapper {

  getInstance(): any;

  getHeader(name: string): number | string | string[] | undefined;

  getHeaders(): OutgoingHttpHeaders;

  getHeaderNames(): string[];

  hasHeader(name: string): boolean;

  removeHeader(name: string): void;

  setHeader(name: string, value: number | string | string[]): this;

  getStatus(): number | undefined;

  setStatus(value: number): this;

  getStream(): Writable;

  send(body: any): this;

  end(): this;

}
