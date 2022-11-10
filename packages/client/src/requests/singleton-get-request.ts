import { SingletonGetQueryOptions } from '@opra/schema';

export class SingletonGetRequest {

  constructor(protected _options: SingletonGetQueryOptions = {}
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


}

