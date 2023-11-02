import '../jest-extend/index.js';
import { ApiExpectBase } from './api-expect-base.js';

export class ApiExpectOperationResult extends ApiExpectBase {

  get not(): ApiExpectOperationResult {
    return new ApiExpectOperationResult(this.response, !this.isNot);
  }

  toBeAffected(min?: number, max?: number): this {
    let msg = '';
    try {
      msg += `The value of "affected" do not match. `;
      const l = this.response.body.affected;
      this._expect(l).toBeGreaterThanOrEqual(min || 1);
      if (max)
        this._expect(l).toBeLessThanOrEqual(max);
    } catch (e: any) {
      if (msg)
        e.message = msg + '\n\n' + e.message;
      Error.captureStackTrace(e, this.toBeAffected);
      throw e;
    }
    return this;
  }

}
