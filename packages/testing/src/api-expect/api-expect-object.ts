import _ from 'lodash';
import { OpraResponse } from '@opra/client';

export class ApiExpectObject {

  constructor(readonly response: OpraResponse, protected _isNot: boolean = false) {
  }

  get not(): ApiExpectObject {
    return new ApiExpectObject(this.response, !this._isNot);
  }

  toMatch<T extends {}>(expected: T): this {
    try {
      const v = _.omitBy(expected, _.isNil);
      this._expect(this.response.data).toMatchObject(v);
    } catch (e: any) {
      Error.captureStackTrace(e, this.toMatch);
      throw e;
    }
    return this;
  }

  toHaveFields(fields: string[]): this {
    try {
      this._expect(this.response.data).toHaveFields(fields);
    } catch (e: any) {
      Error.captureStackTrace(e, this.toHaveFields);
      throw e;
    }
    return this;
  }

  toHaveFieldsOnly(fields: string[]): this {
    try {
      this._expect(this.response.data).toHaveFieldsOnly(fields);
    } catch (e: any) {
      Error.captureStackTrace(e, this.toHaveFieldsOnly);
      throw e;
    }
    return this;
  }

  protected _expect(expected: any): jest.Matchers<any> {
    const out = expect(expected);
    if (this._isNot) return out.not;
    return out;
  }
}
