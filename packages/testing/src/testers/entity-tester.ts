import { CreateQueryOptions, GetQueryOptions, UpdateQueryOptions } from '@opra/core';
import { ResourceKey } from '@opra/url';
import { BaseTester, OpraTesterParams } from './base-tester.js';
import { OpraEntityCreateTester } from './entity-create-tester.js';
import { OpraEntityGetTester } from './entity-get-tester.js';
import { OpraEntitySearchTester } from './entity-search-tester.js';
import { OpraEntityUpdateTester } from './entity-update-tester.js';

export type OpraEntityTesterParams = OpraTesterParams & {
  path: string;
}

export class OpraEntityTester extends BaseTester {
  protected declare readonly _params: OpraEntityTesterParams;

  constructor(params: OpraEntityTesterParams) {
    super(params);
  }


  create(data: {}, options: CreateQueryOptions = {}): OpraEntityCreateTester {
    return new OpraEntityCreateTester({
      ...this._params,
      headers: {...this._params.headers},
      data,
      options
    });
  }

  get(keyValue: ResourceKey, options: GetQueryOptions = {}): OpraEntityGetTester {
    return new OpraEntityGetTester({
      ...this._params,
      headers: {...this._params.headers},
      keyValue,
      options
    });
  }

  search(options: GetQueryOptions = {}): OpraEntitySearchTester {
    return new OpraEntitySearchTester({
      ...this._params,
      headers: {...this._params.headers},
      options
    });
  }

  update(keyValue: ResourceKey, data: {}, options: UpdateQueryOptions = {}): OpraEntityUpdateTester {
    return new OpraEntityUpdateTester({
      ...this._params,
      keyValue,
      headers: {...this._params.headers},
      data,
      options
    });
  }

}
