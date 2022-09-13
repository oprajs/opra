export interface IHttpAdapterContext {
  getRequest(): IHttpRequest;

  getResponse(): IHttpResponse;
}

export interface IHttpRequest {

  getInstance(): any;

  getUrl(): string;

  getMethod(): string;

  getHeaderNames(): string[];

  getHeader(name: string): string | undefined;

  getHeaders(): Record<string, any>;

  getBody(): any;
}

export interface IHttpResponse {

  getInstance(): any;

  getStatus(): number | undefined;

  setStatus(value: number): this;

  getHeaderNames(name: string): string[];

  getHeader(name: string): string | undefined;

  setHeader(name: string, value: string): this;

  send(body: any): this;

  end(): this;
}
