import request, { Response } from 'supertest';
import { DeleteCollectionQueryOption } from '@opra/schema';
import { Expression, OpraURL } from '@opra/url';
import { BaseOperationTester } from './base-operation-tester.js';
import type { OpraEntityTesterParams } from './entity-tester.js';

export type OpraEntityDeleteManyTesterParams = OpraEntityTesterParams & {
  options: DeleteCollectionQueryOption;
}

export class OpraEntityDeleteManyTester extends BaseOperationTester {
  protected declare readonly _params: OpraEntityDeleteManyTesterParams;

  constructor(params: OpraEntityDeleteManyTesterParams) {
    super(params);
  }

  filter(value: string | Expression): this {
    this._params.options.filter = value;
    return this;
  }

  protected async _send(): Promise<Response> {
    const url = new OpraURL(this._params.path);
    url.pathPrefix = this._params.prefix;
    if (this._params.options.filter)
      url.searchParams.set('$filter', this._params.options.filter);
    const req = request(this._params.app);
    const test = req.delete(url.toString());
    this._prepare(test);
    return test.send();
  }

}
