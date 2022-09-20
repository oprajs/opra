export type ContextType = 'http' | 'ws' | 'rpc';
export type PlatformType = 'express';

export namespace IExecutionContext {
  export type OnFinishArgs = {
    userContext: any;
    failed: boolean;
  }
}

export interface IExecutionContext {
  getType(): ContextType;

  getPlatform(): PlatformType;

  switchToHttp(): IHttpExecutionContext;

  onFinish(fn: (args: IExecutionContext.OnFinishArgs) => void | Promise<void>);

}

export interface IHttpExecutionContext extends IExecutionContext {
  getRequest(): any;

  getResponse(): any;

  getRequestWrapper(): IHttpRequestWrapper;

  getResponseWrapper(): IHttpResponseWrapper;
}

export interface IHttpRequestWrapper {

  getInstance(): any;

  getUrl(): string;

  getMethod(): string;

  getHeaderNames(): string[];

  getHeader(name: string): string | undefined;

  getHeaders(): Record<string, any>;

  getBody(): any;
}

export interface IHttpResponseWrapper {

  getInstance(): any;

  getStatus(): number | undefined;

  setStatus(value: number): this;

  getHeaderNames(name: string): string[];

  getHeader(name: string): string | undefined;

  setHeader(name: string, value: string): this;

  send(body: any): this;

  end(): this;
}
