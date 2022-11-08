import { toInt } from 'putil-varhelpers';
import { OpraSchema } from '../../../opra-schema.definition.js';

export const IntegerType: OpraSchema.SimpleType = {
  kind: 'SimpleType',
  description: 'An integer number',
  ctor: Number,
  parse(v: any): number | undefined {
    return toInt(v);
  },
  serialize(v: any): number | undefined {
    return toInt(v);
  }
};
