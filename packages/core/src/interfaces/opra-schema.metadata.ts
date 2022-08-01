import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '@opra/common';
import { TypeThunkAsync } from '../types';

export type EntityResourceMetadata = StrictOmit<OpraSchema.EntityResource, 'type' | 'name'> & {
  type: TypeThunkAsync | string;
  name?: string;
}

export type ResourceListOperationMetadata = OpraSchema.ResourceListOperation;
export type ResourceReadOperationMetadata = OpraSchema.ResourceReadOperation;
