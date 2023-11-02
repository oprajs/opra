import '../jest-extend/index.js';
import isNil from 'lodash.isnil';
import omitBy from 'lodash.omitby';
import { ErrorIssue } from '@opra/common';
import { ApiExpectBase } from './api-expect-base.js';

export type MatchingErrorIssue = Partial<ErrorIssue> &
    {
      message?: RegExp,
      system?: RegExp,
      code?: RegExp,
      details?: RegExp,
      diagnostics?: RegExp,
      [index: string]: any;
    };

export class ApiExpectError extends ApiExpectBase {

  toMatch(expected: (string | RegExp | MatchingErrorIssue)) {
    try {
      if (typeof expected === 'string')
        expected = {message: expected} as MatchingErrorIssue;
      else if (expected instanceof RegExp)
        expected = {message: expect.stringMatching(expected)} as MatchingErrorIssue;

      expected = omitBy(expected, isNil);
      this._expect(this.response.body.errors).toEqual(
          expect.arrayContaining(
              [expect.objectContaining(expected)]
          )
      )
    } catch (e: any) {
      Error.captureStackTrace(e, this.toMatch);
      throw e;
    }
    return this;
  }

}
