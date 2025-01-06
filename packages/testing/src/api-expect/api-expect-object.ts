import typeIs from '@browsery/type-is';
import { omitNullish } from '@jsopen/objects';
import { MimeTypes } from '@opra/common';
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
      const data = typeIs.is(this.response.contentType, [
        MimeTypes.opra_response_json,
      ])
        ? this.response.body.payload
        : this.response.body;
      this._expect(data).toEqual(expect.objectContaining(expected));
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
      const data = typeIs.is(this.response.contentType, [
        MimeTypes.opra_response_json,
      ])
        ? this.response.body.payload
        : this.response.body;
      this._expect(Object.keys(data)).toEqual(expect.arrayContaining(fields));
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
      const data = typeIs.is(this.response.contentType, [
        MimeTypes.opra_response_json,
      ])
        ? this.response.body.payload
        : this.response.body;
      this._expect(Object.keys(data)).toEqual(fields);
    } catch (e: any) {
      Error.captureStackTrace(e, this.toContainAllFields);
      throw e;
    }
    return this;
  }
}
