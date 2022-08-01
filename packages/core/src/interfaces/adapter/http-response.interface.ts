export interface HttpResponse {

  statusCode: number | undefined;

  setStatus(value: number): this;

  setHeader(name: string, value: string): this;

  send(body: any): this;

  end(): this;
}
