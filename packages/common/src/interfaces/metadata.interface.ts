import { StrictOmit } from 'ts-gems';
import { OpraCollectionResourceDef, OpraReadOperationDef, OpraSchema, OpraSchemaProperty } from '../definition';
import { TypeThunk } from '../types';

export type OpraResourceMetadata = OpraCollectionResourceMetadata;

export type OpraCollectionResourceMetadata =
    StrictOmit<OpraCollectionResourceDef, 'entitySchema' | 'operations'>
    & { entityCtor: TypeThunk };

export type OpraReadOperationMetadata = OpraReadOperationDef;

export type OpraSchemaMetadata = StrictOmit<OpraSchema, 'ctor' | 'properties'>

export type OpraSchemaPropertyMetadata = StrictOmit<OpraSchemaProperty, 'type'> & {
  type?: TypeThunk;
}


/*
 *
 */
export function isCollectionResourceMetadata(meta: any): meta is OpraCollectionResourceMetadata {
  return meta && typeof meta === 'object' && meta.resourceKind === 'collection';
}
