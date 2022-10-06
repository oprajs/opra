import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../opra-schema.js';

export type GetSchemaQueryOptions = StrictOmit<OpraSchema.GetSchemaQuery,
    'method' | 'scope' | 'operation'>;

export class OpraGetSchemaQuery implements OpraSchema.GetSchemaQuery {
  readonly kind = 'GetSchemaQuery';
  readonly method = 'schema'
  readonly scope = 'instance';
  readonly operation = 'read';
  resourcePath?: string[];

  constructor(options?: GetSchemaQueryOptions
  ) {
    this.resourcePath = options?.resourcePath;
  }

}
