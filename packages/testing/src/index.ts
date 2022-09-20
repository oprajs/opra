import { Response } from 'supertest';
import { ApiExpect } from './expect/api-expect.js';
import { BaseTester, OpraTesterParams } from './testers/base-tester.js';
import { OpraEntityTester } from './testers/entity-tester.js';

export function opraTest(app: any, options?: Partial<Omit<OpraTesterParams, 'app'>>) {
  return new OpraTester({
    app,
    ...options,
    prefix: options?.prefix || '',
    headers: options?.headers || {}
  });
}


export function apiExpect(response: Response): ApiExpect {
  return new ApiExpect(response);
}

export class OpraTester extends BaseTester {

  entity(path: string): OpraEntityTester {
    return new OpraEntityTester({
      ...this._params,
      headers: {...this._params.headers},
      path
    });
  }

}
