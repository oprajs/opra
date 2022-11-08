import { StrictOmit, Type } from 'ts-gems';
import { OpraSchema } from '../opra-schema.definition.js';
import { TypeThunkAsync } from '../types.js';

export type SimpleTypeMetadata = OpraSchema.SimpleType & {
  name: string;
};

export type ComplexTypeMetadata = StrictOmit<OpraSchema.ComplexType, 'fields' | 'extends'> & {
  name: string;
  extends?: ComplexTypeExtendingMetadata[];
  fields?: Record<string, FieldMetadata>
}

export type FieldMetadata = StrictOmit<OpraSchema.Field, 'type'> & {
  type?: string | TypeThunkAsync | (string | TypeThunkAsync)[];
}

type ComplexTypeExtendingMetadata = StrictOmit<OpraSchema.ComplexTypeExtendingInfo, 'type'> & {
  type: string | Type;
}
