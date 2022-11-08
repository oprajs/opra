import { toString } from 'putil-varhelpers';
import { OpraSchema } from '../../../opra-schema.definition.js';

export const GuidType: OpraSchema.SimpleType = {
  kind: 'SimpleType',
  description: 'A guid value',
  ctor: String,
  parse(v: any): string | undefined {
    return toString(v);
  },
  serialize(v: any): string | undefined {
    return toString(v);
  }
};
