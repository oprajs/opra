import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '@opra/common';
import { TypeThunkAsync } from '../types';

export type EntityResourceMetadata = StrictOmit<OpraSchema.EntityResource, 'type' | 'name'> & {
  type: TypeThunkAsync | string;
  name?: string;
}

export type ResourceReadOperationMetadata = StrictOmit<OpraSchema.ResourceReadOperation, 'handler'>;
export type ResourceSearchOperationMetadata = StrictOmit<OpraSchema.ResourceSearchOperation, 'handler'>;
export type ResourceCreateOperationMetadata = StrictOmit<OpraSchema.ResourceCreateOperation, 'handler'>;
export type ResourceUpdateOperationMetadata = StrictOmit<OpraSchema.ResourceUpdateOperation, 'handler'>;
export type ResourcePatchOperationMetadata = StrictOmit<OpraSchema.ResourcePatchOperation, 'handler'>;
export type ResourceDeleteOperationMetadata = StrictOmit<OpraSchema.ResourceDeleteOperation, 'handler'>;
export type ResourceExecuteOperationMetadata = StrictOmit<OpraSchema.ResourceExecuteOperation, 'handler'>;
