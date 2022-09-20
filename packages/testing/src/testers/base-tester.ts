import { Test } from 'supertest';

export interface OpraTesterParams {
  app: any;
  prefix: string;
  headers: Record<string, string>;
}

export class BaseTester {
  protected readonly _params: OpraTesterParams;

  constructor(params: OpraTesterParams) {
    this._params = params;
  }

  prefix(value: string): this {
    this._params.prefix = value;
    return this;
  }

  header(name: string, value: string) {
    this._params.headers = this._params.headers || {};
    this._params.headers[name] = value;
  }

  protected _prepare(test: Test) {
    const headers = this._params.headers;
    if (headers)
      Object.keys(headers).forEach(k => test.set(k, headers[k]));
  }

}
