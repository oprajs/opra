import { StrictOmit } from 'ts-gems';
import { TypeThunkAsync } from '../../types.js';
import { OpraSchema } from '../opra-schema.interface.js';

export type EntityResourceMetadata = StrictOmit<OpraSchema.EntityResource, 'type' | 'name' | 'methods'> & {
  type: TypeThunkAsync | string;
  name?: string;
}

/*
export type ResourceReadOperationMetadata = StrictOmit<OpraSchema.ResourceReadOperation, 'handler'>;
export type ResourceSearchOperationMetadata = StrictOmit<OpraSchema.ResourceSearchOperation, 'handler'>;
export type ResourceCreateOperationMetadata = StrictOmit<OpraSchema.ResourceCreateOperation, 'handler'>;
export type ResourceUpdateOperationMetadata = StrictOmit<OpraSchema.ResourceUpdateOperation, 'handler'>;
export type ResourcePatchOperationMetadata = StrictOmit<OpraSchema.ResourcePatchOperation, 'handler'>;
export type ResourceDeleteOperationMetadata = StrictOmit<OpraSchema.ResourceDeleteOperation, 'handler'>;
export type ResourceExecuteOperationMetadata = StrictOmit<OpraSchema.ResourceExecuteOperation, 'handler'>;
*/
