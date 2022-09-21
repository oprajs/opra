import './jest-extend.js';
import { Response } from 'supertest';
import { ApiExpectFail } from './api-expect-fail.js';
import { ApiExpectList } from './api-expect-list.js';
import { ApiExpectObject } from './api-expect-object.js';

export class ApiExpect {

  constructor(readonly response: Response) {
  }

  toSuccess(status?: number): this {
    expect(this.response.body.errors).toStrictEqual(undefined);
    if (status)
      expect(this.response.status).toEqual(status);
    else {
      expect(this.response.status).toBeGreaterThanOrEqual(200);
      expect(this.response.status).toBeLessThan(300);
    }
    return this;
  }

  toReturnObject(fn: (body: ApiExpectObject) => void): this {
    expect(this.response.body).toBeDefined();
    fn(new ApiExpectObject(this.response.body));
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
