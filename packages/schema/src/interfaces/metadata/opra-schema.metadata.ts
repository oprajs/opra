import { PartialSome, StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../opra-schema.js';
import { TypeThunkAsync } from '../../types.js';

export type EntityResourceMetadata = PartialSome<StrictOmit<OpraSchema.EntityResource, 'type' | 'methods'>,
    'name' | 'keyFields'> &
    {
      type: TypeThunkAsync | string;
      name?: string;
    }
