import { Response } from 'supertest';
import { ApiResponse } from '../api-response.js';
import { BaseTester } from './base-tester.js';

export abstract class BaseOperationTester extends BaseTester {
  async send(): Promise<ApiResponse>
  async send(fn: (expect: ApiResponse) => void): Promise<void>
  async send(fn?: (expect: ApiResponse) => void): Promise<ApiResponse | void> {
    const response = await this._send();
    const apiResponse = new ApiResponse({
      status: response.status,
      body: response.body,
      headers: response.headers,
      rawBody: response.text,
      contentType: response.type,
      charset: response.charset
    });
    if (fn) {
      fn(apiResponse);
      return;
    }
    return apiResponse;
  }

  protected abstract _send(): Promise<Response>;


}
