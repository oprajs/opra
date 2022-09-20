import { ApiExpectBody } from './api-expect-body.js';

export class ApiExpectResource extends ApiExpectBody {

  constructor(protected _body: any) {
    super();
  }

  toBeDefined(): this {
    expect(this._body).toBeDefined();
    return this;
  }

  toMatch<T extends {}>(value: T): this {
    return this._toMatchObject([this._body], value);
  }

  haveKeysOnly(keys: string[]): this {
    this._haveKeysOnly([this._body], keys);
    return this;
  }

  haveKeys(keys: string[]): this {
    this._haveKeys([this._body], keys);
    return this;
  }

  notHaveKeys(keys: string[]): this {
    this._notHaveKeys([this._body], keys);
    return this;
  }

}
