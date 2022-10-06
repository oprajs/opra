import request, { Response } from 'supertest';
import { GetInstanceQueryOptions } from '@opra/schema';
import { OpraURL, ResourceKey } from '@opra/url';
import { BaseOperationTester } from './base-operation-tester.js';
import type { OpraEntityTesterParams } from './entity-tester';

export type OpraEntityGetTesterParams = OpraEntityTesterParams & {
  keyValue: ResourceKey;
  options: GetInstanceQueryOptions;
}

export class OpraEntityGetTester extends BaseOperationTester {
  protected declare readonly _params: OpraEntityGetTesterParams;

  constructor(params: OpraEntityGetTesterParams) {
    super(params);
  }

  keyValue(value: ResourceKey): this {
    this._params.keyValue = value;
    return this;
  }

  omit(...fields: (string | string[])[]): this {
    this._params.options.omit = fields.flat();
    return this;
  }

  pick(...fields: (string | string[])[]): this {
    this._params.options.pick = fields.flat();
    return this;
  }

  include(...fields: (string | string[])[]): this {
    this._params.options.include = fields.flat();
    return this;
  }

  protected async _send(): Promise<Response> {
    const url = new OpraURL(this._params.path);
    url.pathPrefix = this._params.prefix;
    url.path.get(url.path.size - 1).key = this._params.keyValue;
    if (this._params.options.include)
      url.searchParams.set('$include', this._params.options.include);
    if (this._params.options.pick)
      url.searchParams.set('$pick', this._params.options.pick);
    if (this._params.options.omit)
      url.searchParams.set('$omit', this._params.options.omit);
    const req = request(this._params.app);
    const test = req.get(url.toString());
    this._prepare(test);
    return test.send();
  }

}
