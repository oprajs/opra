import '../expect-extend/index.js';
import { updateErrorMessage } from '@jsopen/objects';
import { MimeTypes } from '@opra/common';
import colors from 'ansi-colors';
import { expect } from 'expect';
import { ApiExpectBase } from './api-expect-base.js';
import { ApiExpectCollection } from './api-expect-collection.js';
import { ApiExpectError } from './api-expect-error.js';
import { ApiExpectObject } from './api-expect-object.js';
import { ApiExpectOperationResult } from './api-expect-operation-result.js';

/**
 * Main entry point for API assertions.
 *
 * @class ApiExpect
 */
export class ApiExpect extends ApiExpectBase {
  /**
   * Asserts that the request was successful (status code 200-399).
   *
   * @param status Optional expected status code.
   * @returns The current ApiExpect instance.
   * @throws {@link Error} if the assertion fails.
   */
  toSuccess(status?: number): this {
    let msg = '';
    try {
      msg += `Status code do not match. `;
      if (status) {
        expect(this.response.status).toEqual(status);
      } else {
        expect(this.response.status).toBeGreaterThanOrEqual(200);
        expect(this.response.status).toBeLessThan(400);
      }
    } catch (e: any) {
      e.message =
        "Request didn't succeeded as expected. " + msg + '\n\n' + e.message;
      const issues = this._parseBodyErrors(this.response.body?.errors);
      if (issues) e.message += '\n\n' + issues;
      else e.message += '\n\nbody: ' + this.response.body;
      if (typeof Error.captureStackTrace === 'function')
        Error.captureStackTrace(e, this.toSuccess);
      else updateErrorMessage(e, e.message);
      throw e;
    }
    return this;
  }

  /**
   * Asserts that the request failed (status code 400-599).
   *
   * @param status Optional expected status code.
   * @returns An {@link ApiExpectError} instance.
   * @throws {@link Error} if the assertion fails.
   */
  toFail(status?: number): ApiExpectError {
    let msg = '';
    try {
      msg += `Status code do not match. `;
      if (status) {
        expect(this.response.status).toEqual(status);
      } else {
        expect(this.response.status).toBeGreaterThanOrEqual(400);
        expect(this.response.status).toBeLessThanOrEqual(599);
      }
    } catch (e: any) {
      e.message =
        "Request didn't failed as expected. " +
        msg +
        '\n\n' +
        e.message +
        '\n\nbody: ' +
        this.response.body;
      if (typeof Error.captureStackTrace === 'function')
        Error.captureStackTrace(e, this.toFail);
      else updateErrorMessage(e, e.message);
      throw e;
    }
    return new ApiExpectError(this.response);
  }

  /**
   * Asserts that the API returned a Collection.
   *
   * @returns An {@link ApiExpectCollection} instance.
   * @throws {@link Error} if the assertion fails.
   */
  toReturnCollection(): ApiExpectCollection {
    let msg = '';
    try {
      msg = 'Content-Type header value is not valid. ';
      expect(this.response.contentType).toEqual(
        'application/opra.response+json',
      );

      msg = 'Type of response "body" is not valid. ';
      expect(typeof this.response.body).toEqual('object');

      msg = 'Type of "payload" is not an Array. ';
      const payload = this.response.body.payload;
      expect(Array.isArray(payload) ? 'array' : typeof payload).toEqual(
        'array',
      );
    } catch (e: any) {
      e.message =
        "Api didn't returned a Collection. " +
        msg +
        '\n\n' +
        e.message +
        '\n\nbody: ' +
        this.response.body;
      const issues = this._parseBodyErrors(this.response.body?.errors);
      if (issues) e.message += '\n\n' + issues;
      if (typeof Error.captureStackTrace === 'function')
        Error.captureStackTrace(e, this.toReturnCollection);
      else updateErrorMessage(e, e.message);
      throw e;
    }
    return new ApiExpectCollection(this.response);
  }

  /**
   * Asserts that the API returned an Object.
   *
   * @param contentType Optional expected Content-Type header value.
   * @returns An {@link ApiExpectObject} instance.
   * @throws {@link Error} if the assertion fails.
   */
  toReturnObject(contentType?: string): ApiExpectObject {
    let msg = '';
    try {
      msg = 'Content-Type header value is not valid. ';
      expect(this.response.contentType).toEqual(
        contentType || MimeTypes.opra_response_json,
      );

      msg = 'Type of response "body" is not valid. ';
      expect(typeof this.response.body).toEqual('object');

      msg = 'Type of "payload" is not an Object. ';
      const payload = this.response.body.payload;
      expect(typeof payload).toEqual('object');
    } catch (e: any) {
      e.message =
        "Api didn't returned an Object. " +
        msg +
        '\n\n' +
        e.message +
        '\n\nbody: ' +
        this.response.body;
      if (typeof Error.captureStackTrace === 'function')
        Error.captureStackTrace(e, this.toReturnObject);
      else updateErrorMessage(e, e.message);
      throw e;
    }
    return new ApiExpectObject(this.response);
  }

  /**
   * Asserts that the API returned an OperationResult.
   *
   * @returns An {@link ApiExpectOperationResult} instance.
   * @throws {@link Error} if the assertion fails.
   */
  toReturnOperationResult(): ApiExpectOperationResult {
    let msg = '';
    try {
      msg = 'Content-Type header value is not valid. ';
      expect(this.response.contentType).toEqual(MimeTypes.opra_response_json);

      msg = 'Type of response "body" is not valid. ';
      expect(typeof this.response.body).toEqual('object');

      msg = 'The response has payload. ';
      const payload = this.response.body.payload;
      expect(typeof payload).toEqual('undefined');
    } catch (e: any) {
      e.message =
        "Api didn't returned a OperationResult. " +
        msg +
        '\n\n' +
        e.message +
        '\n\nbody: ' +
        this.response.body;
      if (msg) e.message = msg + '\n\n' + e.message;
      const issues = this._parseBodyErrors(this.response.body?.errors);
      if (issues) e.message += '\n\n' + issues;
      if (typeof Error.captureStackTrace === 'function')
        Error.captureStackTrace(e, this.toReturnOperationResult);
      else updateErrorMessage(e, e.message);
      throw e;
    }
    return new ApiExpectOperationResult(this.response);
  }

  protected _parseBodyErrors(errors: any[]): string | undefined {
    if (Array.isArray(errors)) {
      let out = '';
      errors.forEach((issue, i) => {
        const stack = Array.isArray(issue.stack)
          ? issue.stack.join('\n')
          : issue.stack;
        out +=
          colors.yellow(errors.length > 1 ? `Error [${i}]: ` : 'Error: ') +
          issue.message +
          '\n' +
          (stack ? '    ' + stack.substring(stack.indexOf('at ')) + '\n' : '');
      });
      return out;
    }
  }
}
