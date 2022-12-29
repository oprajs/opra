import { HttpResponse } from '@opra/node-client';

export class ApiExpectOperationResult {

  constructor(readonly response: HttpResponse, protected _isNot: boolean = false) {
  }

  get not(): ApiExpectOperationResult {
    return new ApiExpectOperationResult(this.response, !this._isNot);
  }

  toBeAffectedExact(expected: number): this {
    try {
      this._expect(this.response.data.affected).toStrictEqual(expected);
    } catch (e: any) {
      Error.captureStackTrace(e, this.toBeAffectedExact);
      throw e;
    }
    return this;
  }

  toBeAffectedMin(expected: number): this {
    try {
      this._expect(this.response.data.affected).toBeGreaterThanOrEqual(expected);
    } catch (e: any) {
      Error.captureStackTrace(e, this.toBeAffectedMin);
      throw e;
    }
    return this;
  }

  toBeAffectedMax(expected: number): this {
    try {
      this._expect(this.response.data.affected).toBeLessThanOrEqual(expected);
    } catch (e: any) {
      Error.captureStackTrace(e, this.toBeAffectedMax);
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
