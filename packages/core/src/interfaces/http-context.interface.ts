export interface HttpAdapterContext {
  getRequest(): HttpRequest;

  getResponse(): HttpResponse;
}

export interface HttpRequest {

  getInstance(): any;

  getUrl(): string;

  getMethod(): string;

  getHeaderNames(): string[];

  getHeader(name: string): string | undefined;

  getHeaders(): Record<string, any>;

  getBody(): any;
}

export interface HttpResponse {

  getInstance(): any;

  getStatus(): number | undefined;

  setStatus(value: number): this;

  getHeaderNames(name: string): string[];

  getHeader(name: string): string | undefined;

  setHeader(name: string, value: string): this;

  send(body: any): this;

  end(): this;
}
