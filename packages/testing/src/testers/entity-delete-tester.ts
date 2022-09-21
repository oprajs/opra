import request, { Response } from 'supertest';
import { CreateQueryOptions } from '@opra/core';
import { OpraURL, ResourceKey } from '@opra/url';
import { BaseOperationTester } from './base-operation-tester.js';
import type { OpraEntityTesterParams } from './entity-tester.js';

export type OpraEntityDeleteTesterParams = OpraEntityTesterParams & {
  keyValue: ResourceKey;
  options: CreateQueryOptions;
}

export class OpraEntityDeleteTester extends BaseOperationTester {
  protected declare readonly _params: OpraEntityDeleteTesterParams;

  constructor(params: OpraEntityDeleteTesterParams) {
    super(params);
  }

  protected async _send(): Promise<Response> {
    const url = new OpraURL(this._params.path);
    url.pathPrefix = this._params.prefix;
    url.path.get(url.path.size - 1).key = this._params.keyValue;
    const req = request(this._params.app);
    const test = req.delete(url.toString());
    this._prepare(test);
    return test.send();
  }

}
