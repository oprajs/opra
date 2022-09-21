import request, { Response } from 'supertest';
import { UpdateManyQueryOptions } from '@opra/core';
import { OpraURL } from '@opra/url';
import { BaseOperationTester } from './base-operation-tester.js';
import type { OpraEntityTesterParams } from './entity-tester.js';

export type OpraEntityUpdateManyTesterParams = OpraEntityTesterParams & {
  data: {};
  options: UpdateManyQueryOptions;
}

export class OpraEntityUpdateManyTester extends BaseOperationTester {
  protected declare readonly _params: OpraEntityUpdateManyTesterParams;

  constructor(params: OpraEntityUpdateManyTesterParams) {
    super(params);
  }

  data(data: {}): this {
    this._params.data = data;
    return this;
  }

  protected async _send(): Promise<Response> {
    const url = new OpraURL(this._params.path);
    url.pathPrefix = this._params.prefix;
    if (this._params.options.filter)
      url.searchParams.set('$filter', this._params.options.filter);
    const req = request(this._params.app);
    const test = req.patch(url.toString());
    this._prepare(test);
    return test.send(this._params.data);
  }

}
