import { ApiExpectBody } from './api-expect-body.js';

export class ApiExpectErrors extends ApiExpectBody {

  constructor(protected _body: any) {
    super();
  }

  toBeDefined(): this {
    expect(this._body.errors).toBeDefined();
    expect(this._body.errors.length).toBeGreaterThan(0);
    return this;
  }

}
