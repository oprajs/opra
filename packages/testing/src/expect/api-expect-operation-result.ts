import type { ApiResponse } from '../api-response';

export class ApiExpectOperationResult {

  constructor(readonly response: ApiResponse) {
  }

  get body(): any {
    return this.response.body;
  }

  toBeAffectedExact(expected: number): this {
    try {
      expect(this.response.body.affected).toStrictEqual(expected);
    } catch (e: any) {
      Error.captureStackTrace(e, this.toBeAffectedExact);
      throw e;
    }
    return this;
  }

  toBeAffectedMin(expected: number): this {
    try {
      expect(this.response.body.affected).toBeGreaterThanOrEqual(expected);
    } catch (e: any) {
      Error.captureStackTrace(e, this.toBeAffectedMin);
      throw e;
    }
    return this;
  }

  toBeAffectedMax(expected: number): this {
    try {
      expect(this.response.body.affected).toBeLessThanOrEqual(expected);
    } catch (e: any) {
      Error.captureStackTrace(e, this.toBeAffectedMax);
      throw e;
    }
    return this;
  }

}
