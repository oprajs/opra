import { Response } from 'supertest';
import { ApiExpect } from '../expect/api-expect.js';
import { BaseTester } from './base-tester.js';

export interface OpraTesterParams {
  app: any;
  prefix: string;
  headers: Record<string, string>;
}

export abstract class BaseOperationTester extends BaseTester {
  async send(): Promise<Response>
  async send(fn: (expect) => void): Promise<void>
  async send(fn?: (expect) => void): Promise<Response | void> {
    const resp = await this._send();
    if (fn) {
      fn(new ApiExpect(resp));
      return;
    }
    return resp;
  }

  protected abstract _send(): Promise<Response>;


}
