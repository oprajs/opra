
export interface HttpAdapterContext {
  getRequest(): HttpRequest;

  getResponse(): HttpResponse;

  getUserContext(): object | undefined;

}

export interface HttpRequest {

  getUrl(): string;

  getMethod(): string;

  getHeader(name: string): string | undefined;

  getHeaderNames(): string[];

  getHeaders(): Record<string, any>;

  getHeaders(): Record<string, any>;
}

export interface HttpResponse {

  statusCode: number | undefined;

  setStatus(value: number): this;

  setHeader(name: string, value: string): this;

  send(body: any): this;

  end(): this;
}
