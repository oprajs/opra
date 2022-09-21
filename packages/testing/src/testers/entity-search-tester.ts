import request, { Response } from 'supertest';
import { SearchQueryOptions } from '@opra/core';
import { Expression, OpraURL } from '@opra/url';
import { BaseOperationTester } from './base-operation-tester.js';
import type { OpraEntityTesterParams } from './entity-tester';

export type OpraEntitySearchTesterParams = OpraEntityTesterParams & {
  options: SearchQueryOptions
}

export class OpraEntitySearchTester extends BaseOperationTester {
  protected declare readonly _params: OpraEntitySearchTesterParams;

  constructor(params: OpraEntitySearchTesterParams) {
    super(params);
  }

  limit(value: number): this {
    this._params.options.limit = value;
    return this;
  }

  skip(value: number): this {
    this._params.options.skip = value;
    return this;
  }

  count(value: boolean): this {
    this._params.options.count = value;
    return this;
  }

  distinct(value: boolean): this {
    this._params.options.distinct = value;
    return this;
  }

  sort(...fields: (string | string[])[]): this {
    this._params.options.sort = fields.flat();
    return this;
  }

  filter(value: string | Expression): this {
    this._params.options.filter = value;
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
    if (this._params.options.include)
      url.searchParams.set('$include', this._params.options.include);
    if (this._params.options.pick)
      url.searchParams.set('$pick', this._params.options.pick);
    if (this._params.options.omit)
      url.searchParams.set('$omit', this._params.options.omit);
    if (this._params.options.sort)
      url.searchParams.set('$sort', this._params.options.sort);
    if (this._params.options.filter)
      url.searchParams.set('$filter', this._params.options.filter);
    if (this._params.options.limit != null)
      url.searchParams.set('$limit', this._params.options.limit);
    if (this._params.options.skip != null)
      url.searchParams.set('$skip', this._params.options.skip);
    if (this._params.options.count != null)
      url.searchParams.set('$count', this._params.options.count);
    if (this._params.options.distinct != null)
      url.searchParams.set('$distinct', this._params.options.distinct);
    const req = request(this._params.app);
    const test = req.get(url.toString());
    this._prepare(test);
    return test.send();
  }
}
