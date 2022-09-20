import { CreateQueryOptions, GetQueryOptions } from '@opra/core';
import { ResourceKey } from '@opra/url';
import { BaseTester, OpraTesterParams } from './base-tester.js';
import { OpraEntityCreateTester } from './entity-create-tester.js';
import { OpraEntityGetTester } from './entity-get-tester.js';

export type OpraEntityTesterParams = OpraTesterParams & {
  path: string;
}

export class OpraEntityTester extends BaseTester {
  protected declare readonly _params: OpraEntityTesterParams;

  constructor(params: OpraEntityTesterParams) {
    super(params);
  }

  get(keyValue: ResourceKey, options: GetQueryOptions = {}): OpraEntityGetTester {
    return new OpraEntityGetTester({
      ...this._params,
      headers: {...this._params.headers},
      keyValue,
      options
    });
  }

  create(data: {}, options: CreateQueryOptions = {}): OpraEntityCreateTester {
    return new OpraEntityCreateTester({
      ...this._params,
      headers: {...this._params.headers},
      data,
      options
    });
  }

}
