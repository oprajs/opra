import matcherUtils from 'jest-matcher-utils';
import { HttpResponse } from '@opra/node-client';
import { objectMatches } from '../utils/object-matches.util.js';
import { ApiExpectObject } from './api-expect-object.js';

export class ApiExpectError extends ApiExpectObject {

  constructor(readonly response: HttpResponse) {
    super(response);
  }

  toContainDetail(...matching: any[]) {
    try {
      expect(this.response.body).toBeDefined();
      expect(this.response.body.issues).toBeDefined();
      expect(this.response.body.issues).apiErrorDetailToContain(matching);
    } catch (e: any) {
      Error.captureStackTrace(e, this.toContainDetail);
      throw e;
    }
  }

}

declare global {
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Matchers<R> {
      apiErrorDetailToContain(...issue: any[]);
    }
  }
}

expect.extend({

  apiErrorDetailToContain(received: any[], issues: any[]) {
    try {
      expect(typeof received).toStrictEqual('object');
      expect(Array.isArray(received)).toStrictEqual(true);
    } catch (e: any) {
      return {
        pass: false,
        message: () => e.message
      };
    }

    for (const m of issues) {
      let matched = false;
      for (const detail of received) {
        if (typeof m === 'object') {
          try {
            objectMatches(detail, m);
            matched = true;
            break;
          } catch {
            //
          }
        }
      }
      if (!matched) {
        return {
          pass: false,
          message: () => `Object does not match: \n` + matcherUtils.stringify(m)
        };
      }
    }
    return {actual: true, pass: true, message: () => ''};
  },
})
