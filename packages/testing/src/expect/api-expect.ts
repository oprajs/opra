import './jest-extend.js';
import { Response } from 'supertest';
import { ApiExpectFail } from './api-expect-fail.js';
import { ApiExpectList } from './api-expect-list.js';
import { ApiExpectResource } from './api-expect-resource.js';

export class ApiExpect {

  constructor(readonly response: Response) {
  }

  toSuccess(status: number = 200): this {
    expect(this.response.body.errors).toStrictEqual(undefined);
    expect(this.response.status).toEqual(status);
    return this;
  }

  toReturnResource(fn: (body: ApiExpectResource) => void): this {
    expect(this.response.body).toBeDefined();
    fn(new ApiExpectResource(this.response.body));
    return this;
  }

  toReturnList(fn: (body: ApiExpectList) => void): this {
    expect(this.response.body).toBeDefined()
    expect(this.response.body.items).toBeDefined();
    fn(new ApiExpectList(this.response.body));
    return this;
  }

  toFail(status: number = 400, fn?: (errors: ApiExpectFail) => void): this {
    expect(this.response.body.errors).toBeDefined();
    expect(this.response.status).toEqual(status);
    if (fn)
      fn(new ApiExpectFail(this.response.body.errors));
    return this;
  }

}
