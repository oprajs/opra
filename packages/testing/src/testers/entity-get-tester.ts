import request, { Response } from 'supertest';
import { GetQueryOptions } from '@opra/core';
import { OpraURL, ResourceKey } from '@opra/url';
import { BaseTester } from './base-tester.js';
import type { OpraEntityTesterParams } from './entity-tester';

export type OpraEntityGetTesterParams = OpraEntityTesterParams & {
  keyValue: ResourceKey,
  options: GetQueryOptions
}

export class OpraEntityGetTester extends BaseTester {
  protected declare readonly _params: OpraEntityGetTesterParams;

  constructor(params: OpraEntityGetTesterParams) {
    super(params);
  }

  async send(): Promise<Response> {
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

}
