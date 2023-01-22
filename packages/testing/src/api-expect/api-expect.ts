import { HttpResponse } from '@opra/common';
import { ApiExpectCollection } from './api-expect-collection.js';
import { ApiExpectError } from './api-expect-error.js';
import { ApiExpectObject } from './api-expect-object.js';
import { ApiExpectOperationResult } from './api-expect-operation-result.js';

export class ApiExpect {

  constructor(readonly response: HttpResponse, protected _isNot: boolean = false) {
  }

  get not(): ApiExpect {
    return new ApiExpect(this.response, !this._isNot);
  }

  toSuccess(status: number = 200): this {
    let msg = '';
    try {
      msg = 'Unexpected "status" returned';
      this._expect(this.response.status).toStrictEqual(status);
    } catch (e: any) {
      if (msg)
        e.message = msg + '\n\n' + e.message;
      Error.captureStackTrace(e, this.toSuccess);
      throw e;
    }
    return this;
  }

  toFail(status: number = 400): ApiExpectError {
    let msg = '';
    try {
      msg = 'Response "status" does not match';
      if (status) {
        expect(this.response.status).toStrictEqual(status);
      } else {
        expect(this.response.status).toBeGreaterThanOrEqual(400);
        expect(this.response.status).toBeLessThanOrEqual(599);
      }
      msg = 'Api did not returned "errors"';
      expect(this.response.body.errors).toBeArray();
      expect(this.response.body.errors.length).toBeGreaterThan(0);
    } catch (e: any) {
      if (msg)
        e.message = msg + '\n\n' + e.message;
      Error.captureStackTrace(e, this.toFail);
      throw e;
    }
    return new ApiExpectError(this.response);
  }

  toReturnOperationResult(): ApiExpectOperationResult {
    let msg = ''
    try {
      msg = '"body" is empty';
      expect(this.response.body).toBeDefined();
      msg = '"operation" property is empty';
      expect(this.response.body.operation).toBeDefined();
    } catch (e: any) {
      if (msg)
        e.message = msg + '\n\n' + e.message;
      Error.captureStackTrace(e, this.toReturnOperationResult);
      throw e;
    }
    return new ApiExpectOperationResult(this.response);
  }

  toReturnObject(): ApiExpectObject {
    let msg = ''
    try {
      msg = '"body" is empty';
      expect(this.response.body).toBeDefined();
      expect(typeof this.response.body).toStrictEqual('object');
    } catch (e: any) {
      if (msg)
        e.message = msg + '\n\n' + e.message;
      Error.captureStackTrace(e, this.toReturnObject);
      throw e;
    }
    return new ApiExpectObject(this.response);
  }

  toReturnCollection(): ApiExpectCollection {
    let msg = ''
    try {
      msg = '"body" is empty';
      expect(this.response.body).toBeDefined();
      msg = '"body" is not an array';
      expect(this.response.body).toBeArray();
    } catch (e: any) {
      if (msg)
        e.message = msg + '\n\n' + e.message;
      Error.captureStackTrace(e, this.toReturnCollection);
      throw e;
    }
    return new ApiExpectCollection(this.response);
  }

  protected _expect(expected: any): jest.Matchers<any> {
    const out = expect(expected);
    if (this._isNot) return out.not;
    return out;
  }

}


