import { toString } from 'putil-varhelpers';
import { OpraSchema } from '../../../opra-schema.definition.js';

export const StringType: OpraSchema.SimpleType = {
  kind: 'SimpleType',
  description: 'A sequence of characters',
  ctor: String,
  parse(v: any): string | undefined {
    return toString(v);
  },
  serialize(v: any): string | undefined {
    return toString(v);
  }
};
