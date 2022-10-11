import { ApiExpect } from './expect/api-expect.js';

export class ApiResponse {
  status: number;
  body: any;
  rawBody: string;
  headers: Record<string, string>;
  contentType: string;
  charset: string;
  readonly expect: ApiExpect;

  constructor(args: Pick<ApiResponse, 'status' | 'body' | 'headers' | 'rawBody' |
      'contentType' | 'charset'>) {
    Object.assign(this, args);
    this.expect = new ApiExpect(this);
  }

  get(header: string): string {
    const key = Object.keys(this.headers).find(k => k.toLowerCase() === header.toLowerCase());
    return (key && this.headers[key]) || '';
  }

}
