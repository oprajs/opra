import _ from 'lodash';
import type { ApiResponse } from '../api-response';

export class ApiExpectObject {

  constructor(readonly response: ApiResponse) {
  }

  get body(): any {
    return this.response.body;
  }

  toMatch<T extends {}>(expected: T): this {
    try {
      const v = _.omitBy(expected, _.isNil);
      expect(this.response.body).toMatchObject(v);
    } catch (e: any) {
      Error.captureStackTrace(e, this.toMatch);
      throw e;
    }
    return this;
  }

  toContainAllKeys(keys: string[]): this {
    try {
      expect(this.response.body).toContainAllKeys(keys);
    } catch (e: any) {
      Error.captureStackTrace(e, this.toContainAllKeys);
      throw e;
    }
    return this;
  }

  toContainKeys(keys: string[]): this {
    try {
      expect(this.response.body).toContainKeys(keys);
    } catch (e: any) {
      Error.captureStackTrace(e, this.toContainKeys);
      throw e;
    }
    return this;
  }

  notToContainKeys(keys: string[]): this {
    try {
      expect(this.response.body).not.toContainKeys(keys);
    } catch (e: any) {
      Error.captureStackTrace(e, this.notToContainKeys);
      throw e;
    }
    return this;
  }

  toHaveProperty(keyPath, value?): this {
    try {
      expect(this.response.body).toHaveProperty(keyPath, value);
    } catch (e: any) {
      Error.captureStackTrace(e, this.toContainKeys);
      throw e;
    }
    return this;
  }

  notToHaveProperty(keyPath, value?): this {
    try {
      expect(this.response.body).not.toHaveProperty(keyPath, value);
    } catch (e: any) {
      Error.captureStackTrace(e, this.toContainKeys);
      throw e;
    }
    return this;
  }
}
