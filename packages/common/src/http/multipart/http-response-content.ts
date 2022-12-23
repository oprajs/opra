export type IHttpResponseContent = Pick<HttpResponseContent, 'status' | 'headers' | 'data'>;

export class HttpResponseContent {
  status: number;
  headers?: Record<string, string | string[]>;
  data?: any;

  constructor(init: IHttpResponseContent) {
    this.status = init.status;
    this.headers = init.headers;
    this.data = init.data;
  }
}
