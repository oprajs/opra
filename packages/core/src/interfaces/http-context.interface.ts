export interface HttpContext {
  getRequest(): HttpRequest;

  getResponse(): HttpResponse;
}

export interface HttpRequest {
  readonly method: string;
  readonly url: string;

  getHeader(name: string): string | undefined;
}

export interface HttpResponse {

  statusCode: number | undefined;

  setStatus(value: number): this;

  setHeader(name: string, value: string): this;

  send(body: any): this;

  end(): this;
}
