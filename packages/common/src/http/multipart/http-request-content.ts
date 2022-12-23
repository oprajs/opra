
export type IHttpRequestContent = Pick<HttpRequestContent, 'method' | 'url' | 'headers' | 'data'>;

export class HttpRequestContent {
  method: string;
  url: string;
  headers?: Record<string, string | string[]>;
  data?: any;

  constructor(init: IHttpRequestContent) {
    this.method = init.method;
    this.url = encodeURI(decodeURI(init.url));
    this.headers = init.headers;
    this.data = init.data;
  }
}
