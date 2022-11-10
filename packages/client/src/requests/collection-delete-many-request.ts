import { CollectionDeleteManyQueryOptions } from '@opra/schema';
import { Expression } from '@opra/url';

export class CollectionDeleteManyRequest {

  constructor(protected _options: CollectionDeleteManyQueryOptions = {}
  ) {
  }

  filter(value: string | Expression): this {
    this._options.filter = value;
    return this;
  }

}

