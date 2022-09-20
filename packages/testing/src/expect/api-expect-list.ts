import { ApiExpectBody } from './api-expect-body.js';

export class ApiExpectList extends ApiExpectBody {

  constructor(protected _body: any) {
    super();
  }

  toBeDefined(): this {
    expect(this._body).toBeDefined()
    expect(this._body.items).toBeDefined();
    return this;
  }

  toMatchObject<T extends {}>(value: T): this {
    return this._toMatchObject(this._body.items || [], value);
  }

  haveKeysOnly(keys: string[]): this {
    this._haveKeysOnly(this._body.items || [], keys);
    return this;
  }

  haveKeys(keys: string[]): this {
    this._haveKeys(this._body.items || [], keys);
    return this;
  }

  notHaveKeys(keys: string[]): this {
    this._notHaveKeys(this._body.items || [], keys);
    return this;
  }

}
