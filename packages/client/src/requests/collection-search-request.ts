import { CollectionSearchQueryOptions } from '@opra/schema';
import { Expression } from '@opra/url';

export class CollectionSearchRequest {

  constructor(protected _options: CollectionSearchQueryOptions = {}
  ) {
  }

  omit(...fields: (string | string[])[]): this {
    this._options.omit = fields.flat();
    return this;
  }

  pick(...fields: (string | string[])[]): this {
    this._options.pick = fields.flat();
    return this;
  }

  include(...fields: (string | string[])[]): this {
    this._options.include = fields.flat();
    return this;
  }

  limit(value: number): this {
    this._options.limit = value;
    return this;
  }

  skip(value: number): this {
    this._options.skip = value;
    return this;
  }

  count(value: boolean = true): this {
    this._options.count = value;
    return this;
  }

  distinct(value: boolean): this {
    this._options.distinct = value;
    return this;
  }

  sort(...fields: (string | string[])[]): this {
    this._options.sort = fields.flat();
    return this;
  }

  filter(value: string | Expression): this {
    this._options.filter = value;
    return this;
  }

}

