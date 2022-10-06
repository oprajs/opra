import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../opra-schema.js';
import { TypeThunkAsync } from '../../types.js';

export type EntityResourceMetadata = StrictOmit<OpraSchema.EntityResource, 'type' | 'name' | 'methods'> & {
  type: TypeThunkAsync | string;
  name?: string;
}
