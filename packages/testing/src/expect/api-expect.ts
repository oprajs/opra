import './jest-extend.js'
import * as matcherUtils from 'jest-matcher-utils';
import { Response } from 'supertest';
import { ApiExpectErrors } from './api-expect-errors.js';
import { ApiExpectList } from './api-expect-list.js';
import { ApiExpectObject } from './api-expect-object.js';
import { printErrors } from './utils/print-errors.util.js';

export class ApiExpect {

  constructor(readonly response: Response) {
  }

  toSuccess(status?: number): this {
    try {
      expect(this.response).apiToSuccess(status)
    } catch (e: any) {
      Error.captureStackTrace(e, this.toSuccess);
      throw e;
    }
    return this;
  }

  toFail(status: number = 400, fn?: (errors: ApiExpectErrors) => void): this {
    try {
      expect(this.response).apiToFail(status)
    } catch (e: any) {
      Error.captureStackTrace(e, this.toSuccess);
      throw e;
    }
    if (fn)
      fn(new ApiExpectErrors(this.response));
    return this;
  }

  toReturnObject(fn: (body: ApiExpectObject) => void): this {
    try {
      expect(this.response).apiToReturnObject();
    } catch (e: any) {
      Error.captureStackTrace(e, this.toReturnObject);
      throw e;
    }
    fn(new ApiExpectObject(this.response));
    return this;
  }

  toReturnList(fn: (body: ApiExpectList) => void): this {
    try {
      expect(this.response).apiToReturnList();
    } catch (e: any) {
      Error.captureStackTrace(e, this.toReturnObject);
      throw e;
    }
    fn(new ApiExpectList(this.response));
    return this;
  }

}


declare global {
  namespace jest {
    interface Matchers<R> {
      apiToSuccess(status?: number);

      apiToFail(status?: number);

      apiToReturnObject();

      apiToReturnList();
    }
  }
}

expect.extend({

  apiToSuccess(response: Response, status?: number) {
    const options: matcherUtils.MatcherHintOptions = {
      isNot: this.isNot,
      promise: this.promise
    }
    try {
      expect(response.body.errors).toStrictEqual(undefined);
    } catch (e: any) {
      return {
        pass: false,
        message: () =>
            `Api returned errors` +
            '\n\n' +
            `Expected:${options.isNot ? ' not' : ''} ${matcherUtils.printExpected(undefined)}\n` +
            `Received:\n${printErrors(response.body.errors)}`
      };
    }
    if (status) {
      try {
        expect(response.status).toEqual(status);
      } catch (e: any) {
        return {
          pass: false,
          message: () => `Status code do not match` +
              '\n\n' +
              `Expected: ${matcherUtils.printExpected(status)}\n` +
              `Received: ${matcherUtils.printReceived(response.status)}`
        };
      }
    } else {
      try {
        expect(response.status).toBeGreaterThanOrEqual(200);
        expect(response.status).toBeLessThan(300);
      } catch (e: any) {
        return {
          pass: false,
          message: () => `Status code do not match` +
              '\n\n' +
              `Expected: ${matcherUtils.printExpected(200)} - ${matcherUtils.printExpected(299)}\n` +
              `Received: ${matcherUtils.printReceived(response.status)}`
        };
      }
    }
    return {actual: true, pass: true, message: () => ''};
  },

  apiToFail(response: Response, status?: number) {
    const options: matcherUtils.MatcherHintOptions = {
      isNot: this.isNot,
      promise: this.promise
    }
    try {
      expect(response.body.errors).toBeDefined();
    } catch (e: any) {
      return {
        pass: false,
        message: () =>
            `Api did not returned errors` +
            '\n\n' +
            `Expected:${options.isNot ? ' not' : ''} ${matcherUtils.printExpected('object')}\n` +
            `Expected:${options.isNot ? ' not' : ''} ${matcherUtils.printExpected(undefined)}\n`
      };
    }
    if (status) {
      try {
        expect(response.status).toEqual(status);
      } catch (e: any) {
        return {
          pass: false,
          message: () => `Status code do not match` +
              '\n\n' +
              `Expected: ${matcherUtils.printExpected(status)}\n` +
              `Received: ${matcherUtils.printReceived(response.status)}`
        };
      }
    } else {
      try {
        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.status).toBeLessThan(499);
      } catch (e: any) {
        return {
          pass: false,
          message: () => `Status code do not match` +
              '\n\n' +
              `Expected: ${matcherUtils.printExpected(400)} - ${matcherUtils.printExpected(499)}\n` +
              `Received: ${matcherUtils.printReceived(response.status)}`
        };
      }
    }
    return {actual: true, pass: true, message: () => ''};
  },

  apiToReturnObject(response: Response) {
    const options: matcherUtils.MatcherHintOptions = {
      isNot: this.isNot,
      promise: this.promise
    }
    try {
      expect(response.body).toBeDefined();
      expect(Object.keys(response.body).length).toBeGreaterThan(0);
    } catch (e: any) {
      return {
        pass: false,
        message: () =>
            `Api did not returned an object` +
            '\n\n' +
            `Expected:${options.isNot ? ' not' : ''} ${matcherUtils.printExpected(true)}\n` +
            `Received:${options.isNot ? ' not' : ''} ${matcherUtils.printReceived(false)}`
      };
    }
    return {actual: true, pass: true, message: () => ''};
  },

  apiToReturnList(response: Response) {
    const options: matcherUtils.MatcherHintOptions = {
      isNot: this.isNot,
      promise: this.promise
    }
    try {
      expect(response.body).toBeDefined()
      expect(response.body.items).toBeDefined();
      expect(Array.isArray(response.body.items)).toStrictEqual(true);
    } catch (e: any) {
      return {
        pass: false,
        message: () =>
            `Api did not returned an list object` +
            '\n\n' +
            `Expected:${options.isNot ? ' not' : ''} ${matcherUtils.printExpected(true)}\n` +
            `Received:${options.isNot ? ' not' : ''} ${matcherUtils.printReceived(false)}`
      };
    }
    return {actual: true, pass: true, message: () => ''};
  }
});
