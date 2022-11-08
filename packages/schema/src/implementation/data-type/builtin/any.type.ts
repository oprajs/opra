import { OpraSchema } from '../../../opra-schema.definition.js';

export const AnyType: OpraSchema.UnionType = {
  kind: 'UnionType',
  description: 'Any value',
  ctor: Object,
  types: []
};
