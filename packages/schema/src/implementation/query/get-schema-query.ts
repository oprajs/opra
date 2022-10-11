import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../opra-schema.js';

export type GetMetadataQueryOptions = StrictOmit<OpraSchema.GetMetadataQuery,
    'method' | 'scope' | 'operation'>;

export class OpraGetMetadataQuery implements OpraSchema.GetMetadataQuery {
  readonly kind = 'GetMetadataQuery';
  readonly method = 'metadata'
  readonly scope = 'instance';
  readonly operation = 'read';
  resourcePath?: string[];

  constructor(options?: GetMetadataQueryOptions
  ) {
    this.resourcePath = options?.resourcePath;
  }

}
