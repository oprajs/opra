import { CollectionUpdateManyQueryOptions } from '@opra/schema';
import { Expression } from '@opra/url';

export class CollectionUpdateManyRequest {

  constructor(protected _options: CollectionUpdateManyQueryOptions = {}
  ) {
  }

  filter(value: string | Expression): this {
    this._options.filter = value;
    return this;
  }

}

