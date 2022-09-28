import { StrictOmit, Type } from 'ts-gems';
import { TypeThunkAsync } from '../../types.js';
import { OpraSchema } from '../opra-schema.interface.js';

export type ComplexTypeMetadata = StrictOmit<OpraSchema.ComplexType, 'fields' | 'extends'> & {
  extends?: ComplexTypeExtendingMetadata[];
  fields?: Record<string, FieldMetadata>
}

export type EntityTypeMetadata = StrictOmit<OpraSchema.EntityType, 'fields'> & {
  fields?: Record<string, FieldMetadata>
}

export type FieldMetadata = StrictOmit<OpraSchema.Field, 'type'> & {
  type?: string | TypeThunkAsync;
}


type ComplexTypeExtendingMetadata = StrictOmit<OpraSchema.ComplexTypeExtendingInfo, 'type'> & {
  type: string | Type;
}
