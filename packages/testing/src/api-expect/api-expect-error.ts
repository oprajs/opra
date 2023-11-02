import '../jest-extend/index.js';
import * as matcherUtils from 'jest-matcher-utils';
import { HttpResponse } from '@opra/client';
import { ErrorIssue } from '@opra/common';
import { objectMatches } from '../utils/object-matches.util.js';
import { ApiExpectObject } from './api-expect-object.js';

export type MatchingErrorIssue = Partial<ErrorIssue> &
    {
      message?: RegExp,
      system?: RegExp,
      code?: RegExp,
      details?: RegExp,
      diagnostics?: RegExp,
      [index: string]: any;
    };

export class ApiExpectError extends ApiExpectObject {

  constructor(readonly response: HttpResponse) {
    super(response);
  }

  toContainError(...issue: (string | RegExp | MatchingErrorIssue)[]) {
    try {
      expect(this.response).apiResponseToContainError(issue);
    } catch (e: any) {
      Error.captureStackTrace(e, this.toContainError);
      throw e;
    }
  }

}

declare global {
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Matchers<R> {
      apiResponseToContainError(issue: (string | RegExp | MatchingErrorIssue)[]);
    }
  }
}

expect.extend({

  apiResponseToContainError(received: HttpResponse<any>, issues: (string | RegExp | MatchingErrorIssue)[]) {
    try {
      expect(received.body).toBeDefined();
      expect(received.body.errors).toBeDefined();
      expect(Array.isArray(received.body.errors)).toStrictEqual(true);
    } catch (e: any) {
      return {
        pass: false,
        message: () => e.message
      };
    }

    for (let matchingIssue of issues) {
      let matched = false;
      for (const receivedIssue of received.body.errors) {
        if (typeof matchingIssue === 'string' || matchingIssue instanceof RegExp)
          matchingIssue = {message: matchingIssue} as MatchingErrorIssue;
        if (typeof matchingIssue === 'object') {
          try {
            objectMatches(receivedIssue, matchingIssue);
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
          message: () => `Object does not match: \n` + matcherUtils.stringify(matchingIssue)
        };
      }
    }
    return {actual: true, pass: true, message: () => ''};
  },
})
