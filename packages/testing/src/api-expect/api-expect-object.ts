import { omitNullish } from '@opra/common';
import { ApiExpectBase } from './api-expect-base.js';

export class ApiExpectObject extends ApiExpectBase {

  get not(): ApiExpectObject {
    return new ApiExpectObject(this.response, !this.isNot);
  }

  /**
   * Tests if Response payload matches given object
   * @param expected
   */
  toMatch<T extends {}>(expected: T): this {
    try {
      expected = omitNullish(expected) as T;
      this._expect(this.response.body.payload).toEqual(
          expect.objectContaining(expected)
      )
    } catch (e: any) {
      Error.captureStackTrace(e, this.toMatch);
      throw e;
    }
    return this;
  }

  /**
   * Tests if Response payload has all of provided fields.
   * @param fields
   */
  toContainFields(fields: string | string[]): this {
    try {
      fields = Array.isArray(fields) ? fields : [fields];
      this._expect(Object.keys(this.response.body.payload))
          .toEqual(expect.arrayContaining(fields));
    } catch (e: any) {
      Error.captureStackTrace(e, this.toContainFields);
      throw e;
    }
    return this;
  }

  /**
   * Tests if Response payload only contains all of provided fields.
   * @param fields
   */
  toContainAllFields(fields: string | string[]): this {
    try {
      fields = Array.isArray(fields) ? fields : [fields];
      this._expect(Object.keys(this.response.body.payload))
          .toEqual(fields);
    } catch (e: any) {
      Error.captureStackTrace(e, this.toContainAllFields);
      throw e;
    }
    return this;
  }

}

