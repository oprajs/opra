import '../jest-extend/index.js';
import colors from 'ansi-colors';
import { ErrorIssue, MimeTypes } from '@opra/common';
import { ApiExpectBase } from './api-expect-base.js';
import { ApiExpectCollection } from './api-expect-collection.js';
import { ApiExpectError } from './api-expect-error.js';
import { ApiExpectObject } from './api-expect-object.js';
import { ApiExpectOperationResult } from './api-expect-operation-result.js';

export class ApiExpect extends ApiExpectBase {
  /**
   * Tests if request succeeded
   * @param status Status code number between 200-299
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
      e.message = "Request didn't succeeded as expected. " + msg + '\n\n' + e.message;

      const issues: ErrorIssue[] = this.response.body?.errors;
      if (issues) {
        e.message += '\n\n';
        issues.forEach((issue, i) => {
          const stack = Array.isArray(issue.stack) ? issue.stack.join('\n') : issue.stack;
          e.message +=
            colors.yellow(issues.length > 1 ? `Error [${i}]: ` : 'Error: ') +
            issue.message +
            '\n' +
            (stack ? '    ' + stack.substring(stack.indexOf('at ')) + '\n' : '');
        });
      }
      Error.captureStackTrace(e, this.toSuccess);
      throw e;
    }
    return this;
  }

  /**
   * Tests if request failed
   * @param status Status code number between 400-599
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
      e.message = "Request didn't failed as expected. " + msg + '\n\n' + e.message;
      const issues = this.response.body?.errors;
      if (issues) {
        e.message += '\n\n';
        issues.forEach((issue, i) => {
          const stack = Array.isArray(issue.stack) ? issue.stack.join('\n') : issue.stack;
          e.message +=
            colors.yellow(issues.length > 1 ? `Error [${i}]: ` : 'Error: ') +
            issue.message +
            '\n' +
            (stack ? '    ' + stack.substring(stack.indexOf('at ')) + '\n' : '');
        });
      }
      Error.captureStackTrace(e, this.toSuccess);
      throw e;
    }
    return new ApiExpectError(this.response);
  }

  /**
   * Tests if API returns a Collection
   */
  toReturnCollection(): ApiExpectCollection {
    let msg = '';
    try {
      msg = 'Content-Type header value is not valid. ';
      expect(this.response.contentType).toEqual('application/opra.response+json');

      msg = 'Type of response "body" is not valid. ';
      expect(typeof this.response.body).toEqual('object');

      msg = 'Type of "payload" is not an Array. ';
      const payload = this.response.body.payload;
      expect(Array.isArray(payload) ? 'array' : typeof payload).toEqual('array');
    } catch (e: any) {
      e.message = "Api didn't returned a Collection. " + msg + '\n\n' + e.message;
      if (msg) e.message = msg + '\n\n' + e.message;
      Error.captureStackTrace(e, this.toReturnCollection);
      throw e;
    }
    return new ApiExpectCollection(this.response);
  }

  /**
   * Tests if API returns an Object
   */
  toReturnObject(contentType?: string): ApiExpectObject {
    let msg = '';
    try {
      msg = 'Content-Type header value is not valid. ';
      expect(this.response.contentType).toEqual(contentType || MimeTypes.opra_response_json);

      msg = 'Type of response "body" is not valid. ';
      expect(typeof this.response.body).toEqual('object');

      msg = 'Type of "payload" is not an Object. ';
      const payload = this.response.body.payload;
      expect(typeof payload).toEqual('object');
    } catch (e: any) {
      e.message = "Api didn't returned an Object. " + msg + '\n\n' + e.message;
      if (msg) e.message = msg + '\n\n' + e.message;
      Error.captureStackTrace(e, this.toReturnCollection);
      throw e;
    }
    return new ApiExpectObject(this.response);
  }

  /**
   * Tests if API returns an OperationResult
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
      e.message = "Api didn't returned a OperationResult. " + msg + '\n\n' + e.message;
      if (msg) e.message = msg + '\n\n' + e.message;
      Error.captureStackTrace(e, this.toReturnCollection);
      throw e;
    }
    return new ApiExpectOperationResult(this.response);
  }
}
